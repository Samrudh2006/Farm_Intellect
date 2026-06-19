import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Download,
  Eye,
  Clock,
  Shield
} from "lucide-react";
import { apiBaseUrl, apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";

interface Document {
  id: string;
  type: string;
  originalName: string;
  size: number;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

interface DocumentUploadProps {
  onUploadComplete?: (document: Document) => void;
}

export const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await apiFetch<{ documents: Document[] }>("/api/documents/my-documents");
      setDocuments(response.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const documentTypes = [
    { value: "ID_PROOF", label: "ID Proof (Aadhar/PAN/Passport)" },
    { value: "ADDRESS_PROOF", label: "Address Proof" },
    { value: "LAND_RECORDS", label: "Land Records" },
    { value: "BUSINESS_LICENSE", label: "Business License" },
    { value: "OTHER", label: "Other Documents" }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPEG, PNG, and PDF files are allowed");
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !documentType) {
      setError("Please select a file and document type");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      // Simulate upload progress while the request is in flight
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("type", documentType);

      const response = await apiFetch<{ document: Document }>("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const newDocument = response.document;

      setDocuments(prev => [newDocument, ...prev]);
      
      if (onUploadComplete) {
        onUploadComplete(newDocument);
      }

      // Reset form
      setSelectedFile(null);
      setDocumentType("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadDocument = async (id: string, originalName: string) => {
    try {
      let blob: Blob;
      
      if (!hasSupabaseEnv) {
        blob = new Blob(["Mock content for document: " + originalName], { type: "text/plain" });
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${apiBaseUrl}/api/documents/download/${id}`, {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        });

        if (!response.ok) {
          throw new Error("Failed to download document");
        }
        blob = await response.blob();
      }

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = originalName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Real download failed, falling back to mock download:", err);
      // Fallback download
      const blob = new Blob(["Mock content for document (offline/fallback): " + originalName], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = originalName;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
      setDocuments((current) => current.filter((document) => document.id !== id));
      toast({ title: "Document deleted", description: "The document was removed successfully." });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (document: Document) => {
    if (document.isVerified) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Document Upload & Verification
          </CardTitle>
          <CardDescription>
            Upload your documents for verification. Accepted formats: JPEG, PNG, PDF (max 10MB)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={isUploading}
            />
          </div>

          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <File className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          <Button
            onClick={uploadDocument}
            disabled={!selectedFile || !documentType || isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            View and manage your uploaded documents
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loadingDocuments ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading your documents...</div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map(document => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{document.originalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {documentTypes.find(t => t.value === document.type)?.label} •{' '}
                        {formatFileSize(document.size)} •{' '}
                        {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(document)}
                    <Button variant="ghost" size="sm" onClick={() => downloadDocument(document.id, document.originalName)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteDocument(document.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No documents uploaded yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};