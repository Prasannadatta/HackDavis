import logging

import httpx

from app.config import settings


logger = logging.getLogger("scamshield")


class ElevenLabsTTSException(Exception):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class ElevenLabsTTS:
    _VOICE_MODES = {
        "calm_coach": {"stability": 0.60, "similarity_boost": 0.75, "style": 0.20, "use_speaker_boost": True},
        "scammer_simulation": {
            "stability": 0.35,
            "similarity_boost": 0.70,
            "style": 0.55,
            "use_speaker_boost": True,
        },
        "safety_explainer": {"stability": 0.70, "similarity_boost": 0.80, "style": 0.15, "use_speaker_boost": True},
    }

    def is_enabled(self) -> bool:
        enabled = bool(settings.ENABLE_ELEVENLABS)
        api_key_configured = bool(settings.ELEVENLABS_API_KEY.strip())
        default_voice_configured = bool((settings.ELEVENLABS_VOICE_ID or "").strip())
        logger.info(
            "ELEVENLABS_CONFIG_CHECK enabled=%s api_key_configured=%s default_voice_configured=%s model=%s",
            str(enabled).lower(),
            str(api_key_configured).lower(),
            str(default_voice_configured).lower(),
            settings.ELEVENLABS_MODEL_ID,
        )
        if not enabled:
            return False
        if not api_key_configured:
            return False
        return bool(self.get_voice_id("en"))

    def get_voice_id(self, language: str) -> str:
        normalized = (language or "en").strip().lower()
        voice_id = ""
        voice_source = "default"
        if normalized == "en" and (settings.ELEVENLABS_VOICE_ID_EN or "").strip():
            voice_id = settings.ELEVENLABS_VOICE_ID_EN.strip()
            voice_source = "language_specific"
        elif normalized == "hi" and (settings.ELEVENLABS_VOICE_ID_HI or "").strip():
            voice_id = settings.ELEVENLABS_VOICE_ID_HI.strip()
            voice_source = "language_specific"
        elif normalized == "es" and (settings.ELEVENLABS_VOICE_ID_ES or "").strip():
            voice_id = settings.ELEVENLABS_VOICE_ID_ES.strip()
            voice_source = "language_specific"
        else:
            voice_id = (settings.ELEVENLABS_VOICE_ID or "").strip()

        logger.info("ELEVENLABS_VOICE_SELECTED language=%s voice_source=%s", normalized, voice_source)
        return voice_id

    def generate_audio(self, text: str, language: str = "en", voice_mode: str = "calm_coach") -> bytes:
        if not text.strip():
            raise ElevenLabsTTSException("Text for TTS must not be empty.", status_code=400)

        if not settings.ENABLE_ELEVENLABS:
            raise ElevenLabsTTSException("ElevenLabs is disabled by configuration.", status_code=503)
        if not settings.ELEVENLABS_API_KEY.strip():
            raise ElevenLabsTTSException("ElevenLabs API key is missing.", status_code=503)

        normalized_language = (language or "en").strip().lower()
        voice_id = self.get_voice_id(normalized_language)
        if not voice_id:
            raise ElevenLabsTTSException(f"ElevenLabs voice id missing for language={normalized_language}.", status_code=503)

        selected_mode = voice_mode if voice_mode in self._VOICE_MODES else "calm_coach"
        payload = {
            "text": text,
            "model_id": settings.ELEVENLABS_MODEL_ID,
            "voice_settings": self._VOICE_MODES[selected_mode],
        }
        if normalized_language in {"hi", "es"}:
            payload["language_code"] = normalized_language

        logger.info(
            "ELEVENLABS_REQUEST language=%s voice_mode=%s model=%s text_length=%d",
            normalized_language,
            selected_mode,
            settings.ELEVENLABS_MODEL_ID,
            len(text),
        )

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"
        headers = {
            "xi-api-key": settings.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }

        try:
            with httpx.Client(timeout=20.0) as client:
                response = client.post(url, json=payload, headers=headers)
            logger.info(
                "ELEVENLABS_RESPONSE status=%d content_type=%s bytes=%d",
                response.status_code,
                response.headers.get("content-type", ""),
                len(response.content or b""),
            )
            if response.status_code != 200:
                reason = (response.text or "").strip()[:300]
                logger.error(
                    "ELEVENLABS_ERROR status=%s message=%s",
                    response.status_code,
                    reason,
                )
                if "language_code" in reason.lower():
                    logger.error("ELEVENLABS_TTS_ERROR message=language_code rejected by ElevenLabs")
                raise ElevenLabsTTSException(
                    f"ElevenLabs request failed with status {response.status_code}: {reason}",
                    status_code=response.status_code,
                )
            if not response.content:
                logger.error("ELEVENLABS_TTS_ERROR message=empty audio response")
                raise ElevenLabsTTSException("ElevenLabs returned empty audio.", status_code=502)
            return response.content
        except ElevenLabsTTSException:
            raise
        except Exception as exc:
            logger.error("ELEVENLABS_TTS_ERROR message=%s", str(exc))
            raise ElevenLabsTTSException("Unable to generate ElevenLabs audio.", status_code=502) from exc


elevenlabs_tts = ElevenLabsTTS()
