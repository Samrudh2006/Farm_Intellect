import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { indianStates, getCitiesByState } from "@/data/indianLocations";
import { User, Building, GraduationCap, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileSetupProps {
  userRole: 'farmer' | 'merchant' | 'expert' | 'admin';
  onComplete: (profileData: any) => void;
}

export const ProfileSetup = ({ userRole, onComplete }: ProfileSetupProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    // Role specific fields
    farmerData: {
      landArea: '',
      soilType: '',
      cropsGrown: [] as string[],
      certifications: '',
      farmType: ''
    },
    merchantData: {
      businessName: '',
      licenseNumber: '',
      preferredCrops: [] as string[],
      businessType: '',
      yearsInBusiness: ''
    },
    expertData: {
      qualifications: '',
      specialization: '',
      experience: '',
      certifications: '',
      consultationFee: ''
    }
  });

  const cropOptions = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Potato', 'Tomato', 'Onion'];
  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky'];

  const handleInputChange = (field: string, value: string, category?: string) => {
    setProfileData(prev => {
      if (category) {
        return {
          ...prev,
          [category]: {
            ...(prev[category as keyof typeof prev] as any),
            [field]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const addCrop = (crop: string, category: 'farmerData' | 'merchantData') => {
    setProfileData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...(category === 'farmerData' 
          ? { cropsGrown: [...prev.farmerData.cropsGrown, crop] }
          : { preferredCrops: [...prev.merchantData.preferredCrops, crop] }
        )
      }
    }));
  };

  const removeCrop = (crop: string, category: 'farmerData' | 'merchantData') => {
    setProfileData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...(category === 'farmerData'
          ? { cropsGrown: prev.farmerData.cropsGrown.filter(c => c !== crop) }
          : { preferredCrops: prev.merchantData.preferredCrops.filter(c => c !== crop) }
        )
      }
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!profileData.displayName || !profileData.email)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setStep(2);
  };

  const handleComplete = () => {
    // Profile data is persisted via Supabase — do not store in localStorage
    toast({
      title: "Profile Setup Complete",
      description: "Your profile has been created successfully!"
    });
    
    onComplete(profileData);
  };

  const getBasicInfoFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name *</Label>
        <Input
          id="displayName"
          value={profileData.displayName}
          onChange={(e) => handleInputChange('displayName', e.target.value)}
          placeholder="Enter your display name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={profileData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={profileData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Location</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={profileData.location.split(', ')[1] || ''}
            onValueChange={(state) => handleInputChange('location', state)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {indianStates.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={profileData.location.split(', ')[0] || ''}
            onValueChange={(city) => {
              const state = profileData.location.split(', ')[1] || '';
              handleInputChange('location', `${city}, ${state}`);
            }}
            disabled={!profileData.location}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {getCitiesByState(profileData.location.split(', ')[1] || '').map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const getRoleSpecificFields = () => {
    switch (userRole) {
      case 'farmer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="landArea">Land Area (acres)</Label>
              <Input
                id="landArea"
                value={profileData.farmerData.landArea}
                onChange={(e) => handleInputChange('landArea', e.target.value, 'farmerData')}
                placeholder="e.g., 5.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="soilType">Soil Type</Label>
              <Select value={profileData.farmerData.soilType} onValueChange={(value) => handleInputChange('soilType', value, 'farmerData')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  {soilTypes.map(soil => (
                    <SelectItem key={soil} value={soil.toLowerCase()}>{soil}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Crops Grown</Label>
              <Select onValueChange={(value) => addCrop(value, 'farmerData')}>
                <SelectTrigger>
                  <SelectValue placeholder="Add crops" />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.filter(crop => !profileData.farmerData.cropsGrown.includes(crop)).map(crop => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.farmerData.cropsGrown.map(crop => (
                  <Badge key={crop} variant="secondary" className="cursor-pointer" onClick={() => removeCrop(crop, 'farmerData')}>
                    {crop} ×
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea
                id="certifications"
                value={profileData.farmerData.certifications}
                onChange={(e) => handleInputChange('certifications', e.target.value, 'farmerData')}
                placeholder="Organic certification, etc."
              />
            </div>
          </div>
        );
        
      case 'merchant':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={profileData.merchantData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value, 'merchantData')}
                placeholder="Enter business name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={profileData.merchantData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value, 'merchantData')}
                placeholder="Business license number"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Preferred Crops</Label>
              <Select onValueChange={(value) => addCrop(value, 'merchantData')}>
                <SelectTrigger>
                  <SelectValue placeholder="Add preferred crops" />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.filter(crop => !profileData.merchantData.preferredCrops.includes(crop)).map(crop => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.merchantData.preferredCrops.map(crop => (
                  <Badge key={crop} variant="secondary" className="cursor-pointer" onClick={() => removeCrop(crop, 'merchantData')}>
                    {crop} ×
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                value={profileData.merchantData.yearsInBusiness}
                onChange={(e) => handleInputChange('yearsInBusiness', e.target.value, 'merchantData')}
                placeholder="e.g., 5"
              />
            </div>
          </div>
        );
        
      case 'expert':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Textarea
                id="qualifications"
                value={profileData.expertData.qualifications}
                onChange={(e) => handleInputChange('qualifications', e.target.value, 'expertData')}
                placeholder="Degree, certifications, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={profileData.expertData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value, 'expertData')}
                placeholder="Crop diseases, soil science, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                value={profileData.expertData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value, 'expertData')}
                placeholder="e.g., 10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee (per hour)</Label>
              <Input
                id="consultationFee"
                value={profileData.expertData.consultationFee}
                onChange={(e) => handleInputChange('consultationFee', e.target.value, 'expertData')}
                placeholder="e.g., 500"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (userRole) {
      case 'farmer': return <User className="h-6 w-6" />;
      case 'merchant': return <Building className="h-6 w-6" />;
      case 'expert': return <GraduationCap className="h-6 w-6" />;
      default: return <User className="h-6 w-6" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          Complete Your {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Profile
        </CardTitle>
        <div className="flex gap-2">
          <div className={`h-2 w-full rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-2 w-full rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>
      </CardHeader>
      
      <CardContent>
        {step === 1 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            {getBasicInfoFields()}
            <Button onClick={handleNext} className="w-full">
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Details
            </h3>
            {getRoleSpecificFields()}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};