import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth, provider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        alert("Logged in successfully");
        navigate("/register");
      } else {
        // Sign-up flow
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          setLoading(false);
          return;
        }

        await createUserWithEmailAndPassword(auth, formData.email, formData.password);

        await axios.post("http://localhost:5000/api/auth/signup", {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });

        alert("Signed up successfully");
        navigate("/register");
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        alert("User already exists. Redirecting to login...");
        setIsLogin(true);
      } else if (err.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } else if (err.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else if (err.response && err.response.status === 409) {
        alert("User already exists. Please login.");
        setIsLogin(true);
      } else {
        alert("Authentication failed");
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await axios.post("http://localhost:5000/api/auth/google", {
        firebaseUid: user.uid,
        email: user.email,
        firstName: user.displayName.split(" ")[0],
        lastName: user.displayName.split(" ")[1] || "",
      });
      alert("Logged in with Google");
      setIsLoggedIn(true);
      navigate("/register");
    } catch (err) {
      console.error(err);
      alert("Google Sign-In Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg mt-16">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
        {isLogin ? "Welcome Back!" : "Create Your Account"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                autoComplete="given-name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                autoComplete="family-name"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
              autoComplete="new-password"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-4 text-gray-400 font-semibold text-sm">OR</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full py-3 rounded-md font-semibold text-white ${
          loading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        Sign in with Google
      </button>

      <p className="mt-6 text-center text-gray-600">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:underline font-semibold"
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default AuthPage;
