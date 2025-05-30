"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Edit3, Save, X, Lock } from "lucide-react";
import Button from "../UI/Button";
import ChangePasswordForm from "./ChangePasswordForm";
import Modal from "../UI/Modal";

const ProfileCard = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any changes
    if (formData.fullName.trim() === user?.fullName) {
      setIsEditing(false);
      return;
    }

    // Validate input
    if (!formData.fullName.trim()) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "error", message: "Full name cannot be empty" },
        })
      );
      return;
    }

    setLoading(true);
    try {
      // Send the data in the format the backend expects
      const updateData = {
        fullName: formData.fullName.trim(),
      };

      await updateProfile(updateData);
      setIsEditing(false);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { type: "success", message: "Profile updated successfully!" },
        })
      );
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: error.message || "Failed to update profile",
          },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
    });
    setIsEditing(false);
  };

  const handleEditClick = (e) => {
    e.preventDefault(); // Prevent form submission
    setFormData({
      fullName: user?.fullName || "",
    });
    setIsEditing(true);
  };

  const handlePasswordSuccess = (message) => {
    window.dispatchEvent(
      new CustomEvent("toast", {
        detail: { type: "success", message },
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-xl overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Profile Settings
              </h1>
              <p className="text-blue-100">Manage your account information</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-md">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-white">
                      {user?.fullName || "Not set"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Username
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-md border border-gray-600">
                  <span className="text-gray-400">@{user?.username}</span>
                  <span className="text-xs text-gray-500">
                    (Cannot be changed)
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-md border border-gray-600">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">{user?.email}</span>
                  <span className="text-xs text-gray-500">
                    (Cannot be changed)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center space-x-2"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center space-x-2"
                    loading={loading}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                    className="flex items-center space-x-2"
                    disabled={loading}
                  >
                    <Lock className="h-4 w-4" />
                    <span>Change Password</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={handleEditClick}
                    className="flex items-center space-x-2"
                    disabled={loading}
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Change Password Modal */}
      {showPasswordForm && (
        <Modal onClose={() => setShowPasswordForm(false)}>
          <ChangePasswordForm
            onClose={() => setShowPasswordForm(false)}
            onSuccess={handlePasswordSuccess}
          />
        </Modal>
      )}
    </div>
  );
};

export default ProfileCard;
