'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useVenueStore, { Court, Venue } from '@/lib/store/useVenueStore';
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

const AVAILABLE_AMENITIES = [
  'Parking',
  'Changing room',
  'Washroom',
  'Flood lights',
  'Cafeteria',
  'First Aid',
  'Wi-Fi'
];

interface VenueFormValues {
  name: string;
  address: string;
  phoneNumber: string;
  description: string;
}

export default function VenuePage() {
  const { 
    venue, 
    isLoading, 
    isSaving, 
    fetchVenue, 
    updateVenue, 
    uploadImage, 
    setVenue 
  } = useVenueStore();

  const [newImage, setNewImage] = useState<File | null>(null);

  const { register, handleSubmit, reset } = useForm<VenueFormValues>();

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  useEffect(() => {
    if (venue) {
      reset({
        name: venue.name,
        address: venue.address,
        phoneNumber: venue.phoneNumber,
        description: venue.description,
      });
    }
  }, [venue, reset]);

  const onSubmit = async (data: VenueFormValues) => {
    if (!venue) return;
    try {
      await updateVenue(data);
      toast.success('Venue updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update venue');
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
    try {
      toast.loading('Uploading image...');
      await uploadImage(newImage);
      setNewImage(null);
      toast.dismiss();
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Failed to upload image');
    }
  };

  const deleteImage = (imageUrl: string) => {
    if (!venue) return;
    setVenue({
      ...venue,
      images: venue.images.filter((img) => img !== imageUrl),
    });
  };

  const addCourt = () => {
    if (!venue) return;
    const newCourt: Court = {
      name: `Court ${venue.courts.length + 1}`,
      pricePerHour: 1000,
    };
    setVenue({
      ...venue,
      courts: [...venue.courts, newCourt],
    });
  };

  const removeCourt = (index: number) => {
    if (!venue) return;
    const newCourts = [...venue.courts];
    newCourts.splice(index, 1);
    setVenue({ ...venue, courts: newCourts });
  };

  if (isLoading && !venue) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Venue Management</h2>
          <p className="text-muted-foreground">
            Control your venue information, pricing, and facilities.
          </p>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
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
                  {...register('name', { required: true })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="address" 
                    className="pl-8"
                    {...register('address', { required: true })}
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
                    {...register('phoneNumber')}
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
                      type="button"
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
                  {venue.amenities.map((a) => (
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Court Pricing & Details</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addCourt}>
                <Plus className="h-4 w-4 mr-1" />
                Add Court
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {venue.courts.map((court, index) => (
                <div key={court.id || `new-${index}`} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="grid gap-1 flex-1 mr-4">
                      <Label className="text-xs">Court Name</Label>
                      <Input 
                        value={court.name} 
                        onChange={(e) => {
                          const newCourts = [...venue.courts];
                          newCourts[index].name = e.target.value;
                          setVenue({ ...venue, courts: newCourts });
                        }}
                        placeholder="e.g. Court A"
                      />
                    </div>
                    <div className="grid gap-1 w-32">
                      <Label className="text-xs">Price Per Hour (Rs.)</Label>
                      <Input 
                        type="number"
                        value={court.pricePerHour} 
                        onChange={(e) => {
                          const newCourts = [...venue.courts];
                          newCourts[index].pricePerHour = parseFloat(e.target.value) || 0;
                          setVenue({ ...venue, courts: newCourts });
                        }}
                      />
                    </div>
                    {!court.id && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeCourt(index)} 
                        className="text-destructive mt-5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {venue.courts.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No courts configured for this venue.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Photos Upload */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Venue Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="image">Upload New Image</Label>
                <div className="flex gap-2">
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  />
                  <Button type="button" size="icon" onClick={handleImageUpload} disabled={!newImage}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {venue.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-video bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Venue ${idx}`} className="w-full h-full object-cover" />
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteImage(img)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}