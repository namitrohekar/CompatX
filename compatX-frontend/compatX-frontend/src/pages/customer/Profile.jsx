import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Edit2, Save, X, Trash2, CheckCircle, AlertCircle, Building2, Hash, Camera } from "lucide-react";
import { toast } from "sonner";
import profileService from "../../services/profileService";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    alternatePhone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    companyName: "",
    gstNumber: "",
  });

  const [originalFormData, setOriginalFormData] = useState({
    fullName: "",
    phone: "",
    alternatePhone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    companyName: "",
    gstNumber: "",
  });

  const [errors, setErrors] = useState({});

  // Generate avatar URL from FULL NAME (not username)
  const getAvatarUrl = (fullName) => {
    if (!fullName) return null;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=6366f1,8b5cf6,ec4899,f59e0b,10b981`;
  };

  // Check if form has unsaved changes (dirty checking)
  const isDirty = () => {
    return Object.keys(formData).some(
      (key) => formData[key] !== originalFormData[key]
    );
  };

  // Check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.state.trim() !== "" &&
      formData.pincode.trim() !== ""
    );
  };

  // Check if form is valid and can be submitted
  const canSubmit = () => {
    if (!profile) {
      // Creating new profile - all required fields must be filled
      return areRequiredFieldsFilled() && Object.keys(errors).length === 0;
    } else {
      // Updating existing profile - must have changes and be valid
      return isDirty() && areRequiredFieldsFilled() && Object.keys(errors).length === 0;
    }
  };

  const fetchMyProfile = async () => {
    setLoading(true);
    const res = await profileService.getMyProfile();

    if (res.success) {
      setProfile(res.data);
      const profileData = {
        fullName: res.data.fullName || "",
        phone: res.data.phone || "",
        alternatePhone: res.data.alternatePhone || "",
        address: res.data.address || "",
        landmark: res.data.landmark || "",
        city: res.data.city || "",
        state: res.data.state || "",
        pincode: res.data.pincode || "",
        companyName: res.data.companyName || "",
        gstNumber: res.data.gstNumber || "",
      };
      setFormData(profileData);
      setOriginalFormData(profileData); // Store original for dirty checking
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[1-9]\d{9,14}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }

    if (formData.alternatePhone && !/^\+?[1-9]\d{9,14}$/.test(formData.alternatePhone.replace(/\s/g, ""))) {
      newErrors.alternatePhone = "Invalid alternate phone";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Invalid pincode (6 digits)";
    }

    if (formData.gstNumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = "Invalid GST number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if no changes made (for updates)
    if (profile && !isDirty()) {
      toast.info("No changes to save");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    const res = await profileService.createOrUpdateMyProfile(formData);

    if (res.success) {
      await fetchMyProfile();
      setIsEditing(false);
      setErrors({});
      toast.success(res.message || "Profile updated successfully");
    } else {
      toast.error(res.error || "Failed to update profile");
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await profileService.deleteMyProfile();

    if (res.success) {
      setProfile(null);
      setFormData({
        fullName: "",
        phone: "",
        alternatePhone: "",
        address: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        companyName: "",
        gstNumber: "",
      });
      setShowDeleteConfirm(false);
      toast.success(res.message || "Profile deleted successfully");
    } else {
      toast.error(res.error || "Failed to delete profile");
    }

    setLoading(false);
  };

  const handleCancel = () => {
    if (isDirty()) {
      toast.info("Discard changes?", {
        action: {
          label: "Discard",
          onClick: () => {
            fetchMyProfile();
            setIsEditing(false);
            setErrors({});
            toast.success("Changes discarded");
          }
        },
      });
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 mt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal information and account settings</p>
      </div>

      {loading && !profile && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border shadow-sm sticky top-24">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {profile?.fullName || formData.fullName ? (
                      <img 
                        src={getAvatarUrl(profile?.fullName || formData.fullName)} 
                        alt={profile?.fullName || formData.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={64} className="text-white" />
                    )}
                  </div>
                </div>
                
                {profile && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {profile.fullName || "Guest User"}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2 text-sm">
                      <Mail size={14} />
                      {profile.email}
                    </p>
                  </>
                )}
              </div>

              {profile && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-indigo-600" />
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium text-gray-900">{profile.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Hash size={16} className="text-green-600" />
                    <span className="text-gray-600">Profile ID:</span>
                    <span className="font-mono text-xs text-gray-900">{profile.profileId}</span>
                  </div>
                  {profile.role && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-blue-600" />
                      <span className="text-gray-600">Role:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {profile.role}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 space-y-3">
                {!isEditing && profile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                )}

                {profile && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                    Delete Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 border shadow-sm">
              {!profile && !isEditing ? (
                <div className="text-center py-12">
                  <AlertCircle size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                    No Profile Found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Create your profile to complete your account setup
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Edit2 size={18} />
                    Create Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {profile ? "Profile Information" : "Create Your Profile"}
                      </h3>
                      {profile && isEditing && isDirty() && (
                        <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                          <AlertCircle size={14} />
                          You have unsaved changes
                        </p>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User size={20} className="text-indigo-600" />
                      Personal Information
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing && profile}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all`}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing && profile}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alternate Phone
                        </label>
                        <input
                          type="text"
                          name="alternatePhone"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.alternatePhone}
                          onChange={handleChange}
                          disabled={!isEditing && profile}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.alternatePhone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all`}
                        />
                        {errors.alternatePhone && (
                          <p className="text-red-500 text-xs mt-1">{errors.alternatePhone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Business Info */}
                  {/* <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Building2 size={20} className="text-indigo-600" />
                      Business Information (Optional)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          placeholder="Your company name"
                          value={formData.companyName}
                          onChange={handleChange}
                          disabled={!isEditing && profile}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST Number
                        </label>
                        <input
                          type="text"
                          name="gstNumber"
                          placeholder="22AAAAA0000A1Z5"
                          value={formData.gstNumber}
                          onChange={handleChange}
                          disabled={!isEditing && profile}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.gstNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all`}
                        />
                        {errors.gstNumber && (
                          <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>
                        )}
                      </div>
                    </div>
                  </div> */}

                  {/* Address */}
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <MapPin size={20} className="text-indigo-600" />
                      Address Details
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Street address, apartment, suite, etc."
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing && profile}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        placeholder="Nearby landmark (optional)"
                        value={formData.landmark}
                        onChange={handleChange}
                        disabled={!isEditing && profile}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleChange}
                          disabled={!isEditing && profile}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all`}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={handleChange}
                          disabled={!isEditing && profile}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all`}
                        />
                        {errors.state && (
                          <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          placeholder="400001"
                          value={formData.pincode}
                          onChange={handleChange}
                          disabled={!isEditing && profile}
                          maxLength={6}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 transition-all`}
                        />
                        {errors.pincode && (
                          <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {(isEditing || !profile) && (
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit()}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                        title={
                          !canSubmit() 
                            ? profile 
                              ? !isDirty() 
                                ? "No changes to save" 
                                : "Fill all required fields"
                              : "Fill all required fields"
                            : ""
                        }
                      >
                        <Save size={18} />
                        {loading ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
                      </button>

                      {profile && (
                        <button
                          onClick={handleCancel}
                          disabled={loading}
                          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Delete Profile?</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete your profile? This action cannot be undone and all your information will be permanently removed.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? "Deleting..." : "Delete Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}