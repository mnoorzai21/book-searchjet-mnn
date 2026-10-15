import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "id_token";

// Stores and reads the login token in localStorage.
class AuthService {
  getProfile() {
    return jwtDecode(this.getToken());
  }

  loggedIn() {
    const token = this.getToken();

    return Boolean(token) && !this.isTokenExpired(token);
  }

  isTokenExpired(token) {
    try {
      return jwtDecode(token).exp < Date.now() / 1000;
    } catch {
      // A token we can't read is treated as expired.
      return true;
    }
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(idToken) {
    localStorage.setItem(TOKEN_KEY, idToken);
    window.location.assign("/");
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("saved_books");
    window.location.assign("/");
  }
}

export default new AuthService();
