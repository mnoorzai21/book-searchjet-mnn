import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useMutation } from "@apollo/client";

import { ADD_USER } from "../utils/mutations";
import Auth from "../utils/auth";

function SignupForm() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [validated, setValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [addUser, { loading }] = useMutation(ADD_USER);

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
      const { data } = await addUser({ variables: formData });
      Auth.login(data.addUser.token);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Alert dismissible onClose={() => setErrorMessage("")} show={Boolean(errorMessage)} variant="danger">
        {errorMessage}
      </Alert>

      <Form.Group className="mb-3" controlId="signup-username">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Your username"
          name="username"
          autoComplete="username"
          onChange={handleChange}
          value={formData.username}
          required
        />
        <Form.Control.Feedback type="invalid">Username is required.</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="signup-email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Your email address"
          name="email"
          autoComplete="email"
          onChange={handleChange}
          value={formData.email}
          required
        />
        <Form.Control.Feedback type="invalid">Enter a valid email.</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="signup-password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="At least 6 characters"
          name="password"
          autoComplete="new-password"
          minLength={6}
          onChange={handleChange}
          value={formData.password}
          required
        />
        <Form.Control.Feedback type="invalid">
          Password must be at least 6 characters.
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" variant="success" disabled={loading}>
        {loading ? "Creating account…" : "Sign up"}
      </Button>
    </Form>
  );
}

export default SignupForm;
