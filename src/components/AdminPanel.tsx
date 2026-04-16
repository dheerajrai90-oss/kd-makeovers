import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '@/src/firebase';
import { 
  collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Appointment, Service, Review, GalleryItem, Offer } from '@/src/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Calendar, Users, Star, Image as ImageIcon, Check, X, Trash2, Plus, Upload, Loader2, Tag 
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [newService, setNewService] = useState({ name: '', description: '', price: '', category: 'Makeup' });
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', category: 'Bridal', file: null as File | null });
  const [newOffer, setNewOffer] = useState({ title: '', description: '', code: '', expiryDate: '', active: true });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!newGalleryItem.file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(newGalleryItem.file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [newGalleryItem.file]);

  useEffect(() => {
    if (!auth.currentUser || auth.currentUser.email !== 'dheeraj.rai90@gmail.com') return;

    const unsubAppointments = onSnapshot(query(collection(db, 'appointments'), orderBy('createdAt', 'desc')), (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    const unsubServices = onSnapshot(query(collection(db, 'services')), (snap) => {
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    });

    const unsubReviews = onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    });

    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), (snap) => {
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem)));
    });

    const unsubOffers = onSnapshot(query(collection(db, 'offers'), orderBy('createdAt', 'desc')), (snap) => {
      setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Offer)));
    });

    return () => {
      unsubAppointments();
      unsubServices();
      unsubReviews();
      unsubGallery();
      unsubOffers();
    };
  }, []);

  // Appointment Actions
  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      toast.success(`Appointment ${status}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  // Service Actions
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'services'), newService);
      toast.success('Service added');
      setNewService({ name: '', description: '', price: '', category: 'Makeup' });
    } catch (e) {
      toast.error('Failed to add service');
    }
  };

  const deleteService = async (id: string) => {
    await deleteDoc(doc(db, 'services', id));
    toast.success('Service deleted');
  };

  // Review Actions
  const toggleReviewApproval = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'reviews', id), { approved: !current });
    toast.success(current ? 'Review hidden' : 'Review approved');
  };

  const deleteReview = async (id: string) => {
    await deleteDoc(doc(db, 'reviews', id));
    toast.success('Review deleted');
  };

  // Gallery Actions
  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.file) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${newGalleryItem.file.name}`);
      await uploadBytes(storageRef, newGalleryItem.file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'gallery'), {
        url,
        title: newGalleryItem.title,
        category: newGalleryItem.category,
        createdAt: serverTimestamp()
      });
      toast.success('Image uploaded to gallery');
      setNewGalleryItem({ title: '', category: 'Bridal', file: null });
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    await deleteDoc(doc(db, 'gallery', id));
    toast.success('Image deleted');
  };

  // Offer Actions
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'offers'), {
        ...newOffer,
        createdAt: serverTimestamp()
      });
      toast.success('Offer added');
      setNewOffer({ title: '', description: '', code: '', expiryDate: '', active: true });
    } catch (e) {
      toast.error('Failed to add offer');
    }
  };

  const toggleOfferActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'offers', id), { active: !current });
    toast.success(current ? 'Offer deactivated' : 'Offer activated');
  };

  const deleteOffer = async (id: string) => {
    await deleteDoc(doc(db, 'offers', id));
    toast.success('Offer deleted');
  };

  if (!auth.currentUser || auth.currentUser.email !== 'dheeraj.rai90@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-pink">
        <Card className="p-8 text-center max-w-md">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-maroon mb-2">Access Denied</h2>
          <p className="text-gray-600">Please login with an admin account to access this panel.</p>
        </Card>
      </div>
    );
  }

  return (
    <section id="admin" className="py-24 bg-soft-pink/20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-serif font-bold text-maroon">Admin Dashboard</h2>
            <p className="text-gray-600">Manage your parlour operations</p>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="bg-white text-maroon border-maroon/20 px-4 py-1">
              Admin: {auth.currentUser.email}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="appointments" className="space-y-8">
          <TabsList className="bg-white border border-maroon/10 p-1 h-auto flex flex-wrap justify-start">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-maroon data-[state=active]:text-white px-6 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-maroon data-[state=active]:text-white px-6 py-2">
              <Plus className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-maroon data-[state=active]:text-white px-6 py-2">
              <Star className="w-4 h-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-maroon data-[state=active]:text-white px-6 py-2">
              <ImageIcon className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="offers" className="data-[state=active]:bg-maroon data-[state=active]:text-white px-6 py-2">
              <Tag className="w-4 h-4 mr-2" />
              Offers
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-maroon flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="font-medium">{app.name}</div>
                            <div className="text-xs text-gray-500">{app.phone}</div>
                          </TableCell>
                          <TableCell>{app.service}</TableCell>
                          <TableCell>
                            <div>{app.date}</div>
                            <div className="text-xs text-gray-500">{app.time}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              app.status === 'confirmed' ? 'bg-green-500' :
                              app.status === 'rejected' ? 'bg-red-500' :
                              app.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'
                            }>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {app.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateAppointmentStatus(app.id!, 'confirmed')}>
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateAppointmentStatus(app.id!, 'rejected')}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {app.status === 'confirmed' && (
                                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => updateAppointmentStatus(app.id!, 'completed')}>
                                  Complete
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => { if(confirm('Delete?')) deleteDoc(doc(db, 'appointments', app.id!)) }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 border-none shadow-xl h-fit">
                <CardHeader><CardTitle className="text-maroon">Add New Service</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Service Name</Label>
                      <Input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select onValueChange={(v: string) => setNewService({...newService, category: v})} defaultValue="Makeup">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bridal">Bridal</SelectItem>
                          <SelectItem value="Makeup">Makeup</SelectItem>
                          <SelectItem value="Hair">Hair</SelectItem>
                          <SelectItem value="Skin">Skin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Price (e.g. ₹5,000)</Label>
                      <Input value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} required />
                    </div>
                    <Button type="submit" className="w-full bg-maroon">Add Service</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-xl">
                <CardHeader><CardTitle className="text-maroon">Manage Services</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell><Badge variant="secondary">{s.category}</Badge></TableCell>
                          <TableCell>{s.price}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteService(s.id!)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="border-none shadow-xl">
              <CardHeader><CardTitle className="text-maroon">Customer Reviews</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>
                          <div className="flex text-gold">
                            {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-gold" />)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{r.comment}</TableCell>
                        <TableCell>
                          <Badge className={r.approved ? 'bg-green-500' : 'bg-gray-400'}>
                            {r.approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => toggleReviewApproval(r.id!, r.approved)}>
                              {r.approved ? 'Hide' : 'Approve'}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteReview(r.id!)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 border-none shadow-xl h-fit">
                <CardHeader><CardTitle className="text-maroon">Upload to Gallery</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadGallery} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Image Title</Label>
                      <Input value={newGalleryItem.title} onChange={e => setNewGalleryItem({...newGalleryItem, title: e.target.value})} placeholder="e.g. Royal Bridal Look" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select onValueChange={(v: string) => setNewGalleryItem({...newGalleryItem, category: v})} defaultValue="Bridal">
                        <SelectTrigger className="border-maroon/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bridal">Bridal</SelectItem>
                          <SelectItem value="Makeup">Makeup</SelectItem>
                          <SelectItem value="Hair">Hair</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Image File</Label>
                      <div className="flex flex-col gap-4">
                        {previewUrl && (
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-maroon/10">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => setNewGalleryItem({...newGalleryItem, file: null})}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${newGalleryItem.file ? 'border-green-500 bg-green-50' : 'border-maroon/20 hover:border-maroon/40'}`}>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={e => setNewGalleryItem({...newGalleryItem, file: e.target.files?.[0] || null})} 
                            required={!newGalleryItem.file}
                          />
                          <div className="flex flex-col items-center justify-center text-sm text-gray-500">
                            <Upload className="w-8 h-8 mb-2 text-maroon/40" />
                            <p className="font-medium text-maroon">{newGalleryItem.file ? newGalleryItem.file.name : 'Click to upload image'}</p>
                            <p className="text-xs">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button type="submit" disabled={isUploading} className="w-full bg-maroon hover:bg-maroon/90 text-white">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      {isUploading ? 'Uploading...' : 'Publish to Gallery'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-xl">
                <CardHeader><CardTitle className="text-maroon">Gallery Items</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {gallery.map(item => (
                      <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border border-maroon/10">
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button size="sm" variant="destructive" onClick={() => deleteGalleryItem(item.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-maroon/80 text-white text-[10px] p-1 truncate">
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 border-none shadow-xl h-fit">
                <CardHeader><CardTitle className="text-maroon">Add New Offer</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleAddOffer} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Offer Title</Label>
                      <Input value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} placeholder="e.g. 20% Off on Bridal" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} placeholder="Offer details..." required />
                    </div>
                    <div className="space-y-2">
                      <Label>Promo Code (Optional)</Label>
                      <Input value={newOffer.code} onChange={e => setNewOffer({...newOffer, code: e.target.value})} placeholder="e.g. BRIDE20" />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiry Date (Optional)</Label>
                      <Input type="date" value={newOffer.expiryDate} onChange={e => setNewOffer({...newOffer, expiryDate: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full bg-maroon">Add Offer</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-xl">
                <CardHeader><CardTitle className="text-maroon">Manage Offers</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Offer</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map(o => (
                        <TableRow key={o.id}>
                          <TableCell>
                            <div className="font-medium">{o.title}</div>
                            <div className="text-xs text-gray-500 max-w-[200px] truncate">{o.description}</div>
                          </TableCell>
                          <TableCell>{o.code || '-'}</TableCell>
                          <TableCell>{o.expiryDate || 'No expiry'}</TableCell>
                          <TableCell>
                            <Badge className={o.active ? 'bg-green-500' : 'bg-gray-400'}>
                              {o.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => toggleOfferActive(o.id!, o.active)}>
                                {o.active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteOffer(o.id!)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
