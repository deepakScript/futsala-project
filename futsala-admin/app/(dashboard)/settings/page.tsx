'use client';

import { useEffect, useState } from 'react';
import axios, { isAxiosError } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Building2, 
  Lock, 
  ShieldCheck, 
  Mail, 
  Phone, 
  UserCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
}

interface VenueDetails {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile');
      const { user, venue } = response.data;
      setProfile(user);
      setVenue(venue);
      setProfileForm({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch('/profile', profileForm);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await axios.put('/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      let message = 'Failed to change password';
      if (isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your account profile, business information, and security settings.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/20 p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Owner Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Business Details
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Verification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="fullName" 
                        value={profileForm.fullName} 
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                         id="email" 
                         type="email"
                         value={profileForm.email} 
                         onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                         className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={profileForm.phoneNumber} 
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
              <CardDescription>Basic contact details for your business.</CardDescription>
            </CardHeader>
            <CardContent>
              {venue ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Business Name</p>
                      <p className="text-lg font-semibold">{venue.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Venue ID</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{venue.id}</code>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Public Email</p>
                      <p>{venue.email || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Phone</p>
                      <p>{venue.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-dashed">
                      <p className="text-sm text-muted-foreground">
                        Note: To edit venue images, facilities, or court details, please go to the 
                        <Button variant="link" className="px-1 h-auto underline" onClick={() => window.location.href='/dashboard/venues'}>
                          Venue Management
                        </Button> 
                        page.
                      </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <AlertCircle className="h-10 w-10 text-orange-400 mb-2" />
                  <p className="font-medium text-muted-foreground">No venue associated with this account.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card className={profile?.isVerified ? "border-green-200 bg-green-50/20" : "border-orange-200 bg-orange-50/20"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {profile?.isVerified ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                )}
                Verification Status
              </CardTitle>
              <CardDescription>
                Details about your venue&apos;s verification status on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2 text-lg font-bold">
                Status: 
                <Badge variant={profile?.isVerified ? "default" : "secondary"}>
                  {profile?.isVerified ? 'VERIFIED' : 'PENDING'}
                </Badge>
              </div>
              
              {profile?.isVerified ? (
                <p className="text-green-700 leading-relaxed max-w-2xl">
                  Congratulations! Your venue is fully verified. You have full access to all features, 
                  including appearing in search results and accepting online payments.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-orange-700 leading-relaxed max-w-2xl">
                    Your account is currently in the verification stage. Our team is reviewing your 
                    business details. In the meantime:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-orange-700">
                    <li>Your venue will not appear in public search results.</li>
                    <li>Online bookings might be restricted.</li>
                    <li>You can still manage your courts and time slots.</li>
                  </ul>
                  <Button disabled className="mt-4">
                    Wait for administrator approval
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}