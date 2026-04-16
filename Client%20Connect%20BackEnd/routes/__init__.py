from .tasks import router as tasks_router
from .auth import router as auth_router

all_routers = [tasks_router, auth_router]
