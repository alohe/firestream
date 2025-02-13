"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getFiles, uploadFile, deleteFile } from "../_actions/files";
import type { File as FileType } from "@prisma/client";
import Loader from "@/components/loader";
import { FileIcon, FileText, Trash2, MoreVertical, Upload, X, Video, Music, Archive, Code } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function FileManager() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (!uploading) {
      setUploadProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [uploading]);

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (err) {
      console.error("Error fetching files:", err);
      toast.error("Failed to load files. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        try {
          await uploadFile(file);
        } catch (err) {
          console.log(">>>>>>>>>>", err);
          throw new Error(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
      });

      await Promise.all(uploadPromises);
      setSelectedFiles([]);
      await fetchFiles();
      setUploadProgress(100);
      setTimeout(() => {
        toast.success(`Successfully uploaded ${selectedFiles.length} file(s)`);
        setDialogOpen(false);
      }, 300);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload files. Please try again.");
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 300);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this file? This action cannot be undone.");
      if (!confirmed) {
        return;
      }

      setDeletingId(id);
      await deleteFile(id);
      
      setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center mt-4">
            <div>
              <h2 className="text-2xl font-semibold">File Management</h2>
              <p className="text-sm text-muted-foreground">
                Upload and manage your files
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                </DialogHeader>
                <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <Label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80 focus-within:outline-none"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        {selectedFiles.length === 0 ? (
                          <span className="text-sm font-medium">
                            Drop files here or click to upload
                          </span>
                        ) : (
                          <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div key={`${file.name}-${index}`} className="flex items-center gap-2">
                                <span className="text-sm">
                                  {file.name} ({Math.round(file.size / 1024)} KB)
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedFiles(files => files.filter((_, i) => i !== index));
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                const input = document.getElementById('file-upload') as HTMLInputElement;
                                input.click();
                              }}
                            >
                              Add More Files
                            </Button>
                          </div>
                        )}
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || []);
                          setSelectedFiles(prev => {
                            // Filter out duplicates based on file name
                            const uniqueFiles = newFiles.filter(newFile => 
                              !prev.some(existingFile => existingFile.name === newFile.name)
                            );
                            if (uniqueFiles.length < newFiles.length) {
                              toast.error("Duplicate files were skipped");
                            }
                            return [...prev, ...uniqueFiles];
                          });
                          e.target.value = ''; // Reset input
                        }}
                        disabled={uploading}
                        multiple
                      />
                    </Label>
                  </div>

                  {uploading && (
                    <div className="w-full max-w-xs mx-auto space-y-2">
                      <Progress value={uploadProgress} className="h-1" />
                      <p className="text-xs text-muted-foreground text-center">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="mt-4"
                  >
                    {uploading ? "Uploading..." : `Upload ${selectedFiles.length > 1 ? selectedFiles.length : ''} File${selectedFiles.length === 1 ? '' : 's'}`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-5">
              <Loader />
            </div>
          ) : files.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow key={file.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {file.mimeType?.startsWith("image/") ? (
                        <Image
                          src={file?.path ? `${process.env.NEXT_PUBLIC_FIRESTREAM_API_URL}${file?.path}` : "#"}
                          alt="preview"
                          className="w-10 h-10 object-cover rounded-md"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md">
                          {file.mimeType?.includes("pdf") ? (
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          ) : file.mimeType?.includes("word") || file.mimeType?.includes("document") ? (
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          ) : file.mimeType?.includes("spreadsheet") || file.mimeType?.includes("excel") ? (
                            <Table className="w-6 h-6 text-muted-foreground" />
                          ) : file.mimeType?.includes("presentation") || file.mimeType?.includes("powerpoint") ? (
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          ) : file.mimeType?.includes("video") ? (
                            <Video className="w-6 h-6 text-muted-foreground" />
                          ) : file.mimeType?.includes("audio") ? (
                            <Music className="w-6 h-6 text-muted-foreground" />
                          ) : file.mimeType?.includes("zip") || file.mimeType?.includes("archive") ? (
                            <Archive className="w-6 h-6 text-muted-foreground" />
                          ) : file.mimeType?.includes("code") || file.mimeType?.includes("text") ? (
                            <Code className="w-6 h-6 text-muted-foreground" />
                          ) : (
                            <FileIcon className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <a
                        href={file?.path ? `${process.env.NEXT_PUBLIC_FIRESTREAM_API_URL}${file?.path}` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {file.name}
                      </a>
                    </TableCell>
                    <TableCell>
                      {file.size < 1024 ? `${file.size} B` :
                       file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` :
                       file.size < 1024 * 1024 * 1024 ? `${Math.round(file.size / (1024 * 1024))} MB` :
                       `${Math.round(file.size / (1024 * 1024 * 1024))} GB`}
                    </TableCell>
                    <TableCell>{file.mimeType}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(file.id)}
                            disabled={deletingId === file.id}
                            className="bg-destructive text-white"
                          >
                            {deletingId === file.id ? (
                              <Loader className="h-4 w-4 mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">No files uploaded yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
