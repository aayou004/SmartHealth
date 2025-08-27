import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./ThemeContext";
import Sidebar from "./Sidebar";
import { useOverflow } from "./useOverflow";
import { motion } from "framer-motion";
import StatusMessage from "./StatusMessage";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";
import "@material/web/menu/menu.js";
import "@material/web/menu/menu-item.js";

const FormField = ({ label, children }) => (
    <div className="p-4 rounded-lg border border-[var(--theme-outline)] mb-4 flex items-center justify-between gap-4">
        <div className="w-1/2">
            <label className="font-semibold text-[var(--theme-text)]">{label}</label>
        </div>
        <div className="w-1/2 flex justify-end">
            {children}
        </div>
    </div>
);

const TextAreaFormField = ({ label, description, children }) => (
    <div className="p-4 rounded-lg border border-[var(--theme-outline)] mb-4">
        <div className="mb-2">
            <label className="font-semibold text-[var(--theme-text)] block">{label}</label>
            {description && <p className="text-xs text-[var(--theme-text)] opacity-70 mt-1">{description}</p>}
        </div>
        {children}
    </div>
);


const UserProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({});
    const { statusMessage, setStatusMessage } = useContext(ThemeContext);
    const user = JSON.parse(localStorage.getItem("user"));
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const scrollRef = useRef(null);
    const isOverflowing = useOverflow(scrollRef);

    useEffect(() => {
        if (!user || !user.user_id) {
            navigate("/");
            return;
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/profile/${user.user_id}`);
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
            setProfilePictureFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setStatusMessage("Invalid file type. Please select a JPG or PNG image.");
        }
    };
    
    const handleRemovePicture = async () => {
        setProfile(prev => ({ ...prev, profile_picture: null }));
        setPreviewUrl(null);
        setProfilePictureFile(null);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.keys(profile).forEach(key => {
            if (profile[key] !== null && profile[key] !== undefined) {
                formData.append(key, profile[key]);
            }
        });

        if (profilePictureFile) {
            formData.append('profile_picture_file', profilePictureFile);
        } else if (profile.profile_picture === null) {
            formData.append('remove_profile_picture', 'true');
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/profile/${user.user_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setStatusMessage("Profile updated successfully!");
            setProfile(res.data.profile);
            setProfilePictureFile(null);
            setPreviewUrl(null);
        } catch (error) {
            setStatusMessage("Failed to update profile.");
            console.error("Profile update error:", error);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/export/${user.user_id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `health_data_${user.user_id}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to export data:", error);
            setStatusMessage("No data to export or an error occurred.");
        }
    };

    return (
        <div className="flex h-screen bg-transparent">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="container mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col min-h-0">
                    <div className="relative bg-[var(--theme-card-bg)] p-6 rounded-xl border border-[var(--theme-outline)] backdrop-blur-lg flex-1 flex flex-col min-h-0">
                        <div ref={scrollRef} className={`flex-1 overflow-y-auto ${isOverflowing ? 'pr-4' : ''}`}>
                            <h2 className="text-3xl font-bold mb-6 text-center text-[var(--theme-text)]">User Profile</h2>
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-48 h-48 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {previewUrl || profile.profile_picture ? (
                                            <img 
                                                src={previewUrl || `http://localhost:5000/${profile.profile_picture}?${new Date().getTime()}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-500">No Image</span>
                                        )}
                                    </div>
                                    <div className="absolute top-1 right-1">
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                            <md-icon-button id="edit-anchor" className="bg-black/20 dark:bg-white/20 rounded-full" onClick={() => setMenuOpen(prev => !prev)}>
                                                <md-icon>edit</md-icon>
                                            </md-icon-button>
                                        </motion.div>
                                        <md-menu 
                                            anchor="edit-anchor" 
                                            open={isMenuOpen} 
                                            onClosed={() => setMenuOpen(false)}
                                            anchor-corner="start-start"
                                            menu-corner="start-end"
                                        >
                                            {profile.profile_picture || previewUrl ? (
                                                <>
                                                    <md-menu-item onClick={() => {document.getElementById('profile_picture_upload').click(); setMenuOpen(false);}}>
                                                        <div slot="headline">Edit</div>
                                                    </md-menu-item>
                                                    <md-menu-item onClick={() => {handleRemovePicture(); setMenuOpen(false);}}>
                                                        <div slot="headline">Remove</div>
                                                    </md-menu-item>
                                                </>
                                            ) : (
                                                <md-menu-item onClick={() => {document.getElementById('profile_picture_upload').click(); setMenuOpen(false);}}>
                                                    <div slot="headline">Upload</div>
                                                </md-menu-item>
                                            )}
                                        </md-menu>
                                    </div>
                                    <input 
                                        type="file" 
                                        id="profile_picture_upload" 
                                        accept=".jpg, .jpeg, .png"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <form id="profile-form" onSubmit={handleProfileUpdate}>
                                <FormField label="Name">
                                    <md-outlined-text-field class="w-full max-w-xs" id="name" value={profile.name || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                 <FormField label="Gender">
                                    <md-outlined-select class="w-full max-w-xs" id="gender" value={profile.gender || ""} onChange={handleInputChange}>
                                        <md-select-option value=""></md-select-option>
                                        <md-select-option value="male">Male</md-select-option>
                                        <md-select-option value="female">Female</md-select-option>
                                        <md-select-option value="non-binary">Non-binary</md-select-option>
                                        <md-select-option value="prefer-not-to-say">Prefer not to say</md-select-option>
                                    </md-outlined-select>
                                </FormField>
                                <FormField label="Pronouns">
                                    <md-outlined-select class="w-full max-w-xs" id="pronouns" value={profile.pronouns || ""} onChange={handleInputChange}>
                                        <md-select-option value=""></md-select-option>
                                        <md-select-option value="he/him">he/him</md-select-option>
                                        <md-select-option value="she/her">she/her</md-select-option>
                                        <md-select-option value="they/them">they/them</md-select-option>
                                        <md-select-option value="it/its">it/its</md-select-option>
                                        <md-select-option value="other/unspecified">other/unspecified</md-select-option>
                                    </md-outlined-select>
                                </FormField>
                                <FormField label="Date of Birth">
                                    <md-outlined-text-field class="w-full max-w-xs" id="dob" type="date" value={profile.dob || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Height (cm)">
                                    <md-outlined-text-field class="w-full max-w-xs" id="height" type="number" value={profile.height || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Weight (kg)">
                                    <md-outlined-text-field class="w-full max-w-xs" id="weight" type="number" value={profile.weight || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </FormField>
                                <FormField label="Blood Type">
                                    <md-outlined-select class="w-full max-w-xs" id="blood_type" value={profile.blood_type || ""} onChange={handleInputChange}>
                                        <md-select-option value=""></md-select-option>
                                        <md-select-option value="A+">A+</md-select-option>
                                        <md-select-option value="A-">A-</md-select-option>
                                        <md-select-option value="B+">B+</md-select-option>
                                        <md-select-option value="B-">B-</md-select-option>
                                        <md-select-option value="AB+">AB+</md-select-option>
                                        <md-select-option value="AB-">AB-</md-select-option>
                                        <md-select-option value="O+">O+</md-select-option>
                                        <md-select-option value="O-">O-</md-select-option>
                                    </md-outlined-select>
                                </FormField>
                                <TextAreaFormField label="Primary Goals" description="List your main health and wellness objectives (e.g., lose weight, build muscle).">
                                    <md-outlined-text-field class="w-full resize-none" id="primary_goals" type="textarea" rows="3" value={profile.primary_goals || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </TextAreaFormField>
                                <TextAreaFormField label="Dietary Preferences" description="List any dietary preferences or restrictions (e.g., vegetarian, gluten-free).">
                                    <md-outlined-text-field class="w-full resize-none" id="dietary_preferences" type="textarea" rows="3" value={profile.dietary_preferences || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </TextAreaFormField>
                                <TextAreaFormField label="Medical Conditions" description="List any relevant medical conditions, past or present.">
                                    <md-outlined-text-field class="w-full resize-none" id="medical_conditions" type="textarea" rows="3" value={profile.medical_conditions || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </TextAreaFormField>
                                <TextAreaFormField label="Allergies" description="List any known allergies to food, medication, or other substances.">
                                    <md-outlined-text-field class="w-full resize-none" id="allergies" type="textarea" rows="3" value={profile.allergies || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </TextAreaFormField>
                                <TextAreaFormField label="Workout Preferences" description="List your preferred physical activities (e.g., running, yoga, team sports).">
                                    <md-outlined-text-field class="w-full resize-none" id="workout_preferences" type="textarea" rows="3" value={profile.workout_preferences || ""} onInput={handleInputChange}></md-outlined-text-field>
                                </TextAreaFormField>
                            </form>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <md-outlined-button type="button" onClick={handleExport}>Export to CSV</md-outlined-button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <md-filled-button type="button" onClick={handleProfileUpdate}>Save Changes</md-filled-button>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserProfile;
