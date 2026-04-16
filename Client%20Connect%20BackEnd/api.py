import os
from fastapi import FastAPI
from routes import all_routers
import dotenv

dotenv.load_dotenv(verbose=True)

app = FastAPI()

for router in all_routers:
    app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=os.getenv("HOST_NAME", "127.0.0.1"),
        port=int(os.getenv("APP_PORT", 8000)),
    )
