"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import Button from "../UI/Button";

const ChangePasswordForm = ({ onClose, onSuccess }) => {
  const { updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/\d/.test(password)) errors.push("One number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push("One special character");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(", ");
      }
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(formData);
      onSuccess?.("Password updated successfully!");
      onClose();
    } catch (error) {
      setErrors({ general: error.message || "Failed to update password" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const passwordStrength = validatePassword(formData.newPassword);
  const isPasswordStrong =
    passwordStrength.length === 0 && formData.newPassword.length > 0;

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Lock className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Change Password</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-700">
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-md p-3">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Current Password *
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              required
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                errors.currentPassword ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility("current")}
            >
              {showPasswords.current ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-400">
              {errors.currentPassword}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            New Password *
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? "text" : "password"}
              required
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                errors.newPassword ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility("new")}
            >
              {showPasswords.new ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className={`h-2 w-full rounded-full ${
                    isPasswordStrong
                      ? "bg-green-500"
                      : passwordStrength.length <= 2
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-current transition-all duration-300"
                    style={{
                      width: `${Math.max(
                        20,
                        (5 - passwordStrength.length) * 20
                      )}%`,
                    }}
                  />
                </div>
                {isPasswordStrong && (
                  <Check className="h-4 w-4 text-green-400" />
                )}
              </div>

              {passwordStrength.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">
                    Password must include:
                  </p>
                  {passwordStrength.map((requirement, index) => (
                    <p key={index} className="text-xs text-red-400">
                      • {requirement}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Confirm New Password *
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Match Indicator */}
          {formData.confirmPassword && (
            <div className="mt-1 flex items-center space-x-1">
              {formData.newPassword === formData.confirmPassword ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400">
                    Passwords match
                  </span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-red-400">
                    Passwords do not match
                  </span>
                </>
              )}
            </div>
          )}

          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={
              !isPasswordStrong ||
              formData.newPassword !== formData.confirmPassword
            }
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
