import React, { useState, useEffect } from 'react';
import { User, Save, Loader2, Mail, Briefcase, Phone, Calendar, Users } from 'lucide-react';
import { profileApi } from '@/services/api';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/useToast';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    age: 0,
    gender: '',
    phoneNumber: '',
    workingIn: '',
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
      setFormData({
        age: data.age,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        workingIn: data.workingIn,
      });
    } catch (error) {
      addToast('Failed to load profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await profileApi.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500">Manage your account information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <User className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="w-24 h-24 mx-auto bg-blue-600">
              <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mt-4">{profile.name}</h2>
            <p className="text-slate-500">{profile.email}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Briefcase className="w-4 h-4" />
              <span>{profile.workingIn}</span>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input value={profile.email} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500">
                  <User className="w-4 h-4" />
                  Name
                </Label>
                <Input value={profile.name} disabled className="bg-slate-50" />
              </div>
            </div>

            <Separator />

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  Age
                </Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
                  }
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-slate-50' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500">
                  <Users className="w-4 h-4" />
                  Gender
                </Label>
                <Input
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-slate-50' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-slate-50' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-500">
                  <Briefcase className="w-4 h-4" />
                  Working In
                </Label>
                <Input
                  value={formData.workingIn}
                  onChange={(e) =>
                    setFormData({ ...formData, workingIn: e.target.value })
                  }
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-slate-50' : ''}
                />
              </div>
            </div>

            {/* Action buttons */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      age: profile.age,
                      gender: profile.gender,
                      phoneNumber: profile.phoneNumber,
                      workingIn: profile.workingIn,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
