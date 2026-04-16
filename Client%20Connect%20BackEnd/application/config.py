from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import computed_field
from typing import List


class Settings(BaseSettings):
    auth0_domain: str
    auth0_api_audience_raw: str  # Read as string first
    auth0_issuer: str
    auth0_algorithms: str
    auth0_client_id: str

    class Config:
        env_file = "auth.env"
        case_sensitive = False

    @computed_field  # Available in Pydantic v2+
    @property
    def auth0_api_audience(self) -> List[str]:
        return [
            aud.strip() for aud in self.auth0_api_audience_raw.split("|") if aud.strip()
        ]


@lru_cache()
def get_settings():
    return Settings()
