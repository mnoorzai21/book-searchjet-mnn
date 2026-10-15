import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useMutation } from "@apollo/client";

import { LOGIN_USER } from "../utils/mutations";
import Auth from "../utils/auth";

function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [validated, setValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [login, { loading }] = useMutation(LOGIN_USER);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!event.currentTarget.checkValidity()) {
      setValidated(true);
      return;
    }

    try {
      const { data } = await login({ variables: formData });
      Auth.login(data.login.token);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Alert dismissible onClose={() => setErrorMessage("")} show={Boolean(errorMessage)} variant="danger">
        {errorMessage}
      </Alert>

      <Form.Group className="mb-3" controlId="login-email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Your email"
          name="email"
          autoComplete="email"
          onChange={handleChange}
          value={formData.email}
          required
        />
        <Form.Control.Feedback type="invalid">Enter a valid email.</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="login-password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Your password"
          name="password"
          autoComplete="current-password"
          onChange={handleChange}
          value={formData.password}
          required
        />
        <Form.Control.Feedback type="invalid">Password is required.</Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" variant="success" disabled={loading}>
        {loading ? "Logging in…" : "Log in"}
      </Button>
    </Form>
  );
}

export default LoginForm;
