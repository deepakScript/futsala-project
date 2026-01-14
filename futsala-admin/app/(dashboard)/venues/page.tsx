'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Trash2, 
  Plus, 
  Upload, 
  Check, 
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Court {
  id: string;
  name: string;
  pricePerHour: number;
  courtType: string;
  surfaceType: string;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  description: string;
  amenities: string[];
  images: string[];
  courts: Court[];
}

const AVAILABLE_AMENITIES = [
  'Parking',
  'Changing room',
  'Washroom',
  'Flood lights',
  'Cafeteria',
  'First Aid',
  'Wi-Fi'
];

export default function VenuePage() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);

  const fetchVenue = async () => {
    try {
      const response = await axios.get('/venues');
      setVenue(response.data);
    } catch (error) {
      toast.error('Failed to load venue information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, []);

  const handleUpdateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue) return;
    
    setSaving(true);
    try {
      await axios.patch('/venues', venue);
      toast.success('Venue updated successfully');
    } catch (error) {
      toast.error('Failed to update venue');
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (!venue) return;
    const current = [...venue.amenities];
    const index = current.indexOf(amenity);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(amenity);
    }
    setVenue({ ...venue, amenities: current });
  };

  const handleImageUpload = async () => {
    if (!newImage || !venue) return;
    
    const formData = new FormData();
    formData.append('file', newImage);
    formData.append('venueId', venue.id);

    try {
      toast.loading('Uploading image...');
      const response = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVenue({ ...venue, images: [...venue.images, response.data.url] });
      setNewImage(null);
      toast.dismiss();
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to upload image');
    }
  };

  const deleteImage = (imageUrl: string) => {
    if (!venue) return;
    setVenue({
      ...venue,
      images: venue.images.filter(img => img !== imageUrl)
    });
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No Venue Assigned</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Please contact administration to assign a venue to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Venue Management</h2>
          <p className="text-muted-foreground">
            Control your venue information, pricing, and facilities.
          </p>
        </div>
        <Button onClick={handleUpdateVenue} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Basic Info & Facilities */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Venue Name</Label>
                <Input 
                  id="name" 
                  value={venue.name} 
                  onChange={(e) => setVenue({...venue, name: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="address" 
                    className="pl-8"
                    value={venue.address} 
                    onChange={(e) => setVenue({...venue, address: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    className="pl-8"
                    value={venue.phoneNumber} 
                    onChange={(e) => setVenue({...venue, phoneNumber: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const isSelected = venue.amenities.includes(amenity);
                  return (
                    <Button
                      key={amenity}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleAmenity(amenity)}
                      className="rounded-full"
                    >
                      {isSelected ? <Check className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                      {amenity}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Active Facilities List:</p>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map(a => (
                    <Badge key={a} variant="secondary" className="gap-1 px-3">
                      {a}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleAmenity(a)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Court Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Court Pricing & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {venue.courts.map((court, index) => (
                <div key={court.id || index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{court.name || `Court ${index + 1}`}</h4>
                    <Badge>Active</Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-xs">Price Per Hour (Rs.)</Label>
                      <Input 
                        type="number"
                        value={court.pricePerHour} 
                        onChange={(e) => {
                          const newCourts = [...venue.courts];
                          newCourts[index].pricePerHour = parseFloat(e.target.value);
                          setVenue({...venue, courts: newCourts});
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs">Ground Size / Type</Label>
                      <Input 
                        value={court.courtType} 
                        placeholder="e.g. 5-a-side"
                        onChange={(e) => {
                          const newCourts = [...venue.courts];
                          newCourts[index].courtType = e.target.value;
                          setVenue({...venue, courts: newCourts});
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Photos Manager */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-2">
                  {venue.images.map((url, i) => (
                    <div key={i} className="group relative aspect-square rounded-md overflow-hidden bg-secondary">
                      <img src={url} alt={`Venue ${i}`} className="object-cover w-full h-full" />
                      <button 
                         onClick={() => deleteImage(url)}
                         className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {venue.images.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                      No photos uploaded yet.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Input 
                    type="file" 
                    id="photo" 
                    className="hidden" 
                    onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  />
                  <Label 
                    htmlFor="photo" 
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/20 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">Click to select photo</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {newImage ? newImage.name : 'Max 5MB per image'}
                    </span>
                  </Label>
                  {newImage && (
                    <Button className="w-full" onClick={handleImageUpload}>
                      Confirm Upload
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm">Policy & Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                className="w-full min-h-[150px] bg-transparent border-none focus:ring-0 text-sm" 
                placeholder="List your venue rules, cancellation policies, etc."
                value={venue.description}
                onChange={(e) => setVenue({...venue, description: e.target.value})}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}