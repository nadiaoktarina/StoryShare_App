import RegisterPage from "../pages/auth/register/register-page";
import LoginPage from "../pages/auth/login/login-page";
import HomePage from "../pages/home/home-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import StoryDetailPage from "../pages/detail-story/detail-story-page";
import NewPage from "../pages/tambah/tambah-data-page";
import NotFoundPage from "../pages/not-found/not-found-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";

export const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/tambah": () => checkAuthenticatedRoute(new NewPage()),
  "/stories/:id": () => checkAuthenticatedRoute(new StoryDetailPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
  "*": () => NotFoundPage(),
};
