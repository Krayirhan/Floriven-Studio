from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # D-02: Model sağlayıcısı ertelendi — stub
    model_provider: str = "stub"
    model_api_key: str = ""
    model_name: str = ""

    rabbitmq_url: str = "amqp://guest:guest@localhost:5672"
    api_base_url: str = "http://localhost:8080"

    generation_queue: str = "floriven.generation.jobs"
    result_exchange: str = "floriven.results"


settings = Settings()
