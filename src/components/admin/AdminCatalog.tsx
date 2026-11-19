import React, { useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Edit, Plus, Star, Trash2, Upload, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import { db, storage } from '@/src/firebase';
import {
  BridalPackage,
  GalleryCategory,
  GalleryItem,
  Offer,
  OfferType,
  PackageTier,
  Review,
  Service,
  ServiceCategory,
} from '@/src/types';
import {
  ALL_SERVICE_CATEGORIES,
  DEFAULT_PACKAGES,
  DEFAULT_SERVICES,
  GALLERY_CATEGORIES,
} from '@/src/data/defaults';

interface AdminCatalogProps {
  section: 'services' | 'packages' | 'gallery' | 'offers';
  services: Service[];
  serviceCategories: ServiceCategory[];
  packages: BridalPackage[];
  gallery: GalleryItem[];
  reviews: Review[];
  offers: Offer[];
  onLog: (action: string, entityType: string, entityId: string, details: string) => Promise<void>;
}

export default function AdminCatalog({
  section,
  services,
  serviceCategories,
  packages,
  gallery,
  reviews,
  offers,
  onLog,
}: AdminCatalogProps) {
  // Services state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvForm, setSrvForm] = useState({
    name: '',
    category: 'Bridal Makeup',
    price: '',
    numericPrice: '0',
    durationMinutes: '60',
    description: '',
    imageUrl: '',
    active: true,
    featured: false,
  });
  const [srvFile, setSrvFile] = useState<File | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Packages state
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [pkgForm, setPkgForm] = useState({
    name: '',
    tier: 'Bridal' as PackageTier,
    price: '',
    numericPrice: '0',
    includedText: '',
    description: '',
    specialOffer: '',
    durationMinutes: '180',
    imageUrl: '',
    active: true,
  });
  const [pkgFile, setPkgFile] = useState<File | null>(null);

  // Gallery state
  const [galForm, setGalForm] = useState({
    title: '',
    category: 'Bridal Makeup' as GalleryCategory,
    caption: '',
    isActualClientWork: true,
  });
  const [galFile, setGalFile] = useState<File | null>(null);
  const [editingGalId, setEditingGalId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Offers state
  const [offForm, setOffForm] = useState({
    title: '',
    description: '',
    code: '',
    offerType: 'Discount' as OfferType,
    discountLabel: '',
    expiryDate: '',
    active: true,
  });

  const categoryOptions = Array.from(
    new Set([
      ...ALL_SERVICE_CATEGORIES,
      ...serviceCategories.filter((c) => c.active).map((c) => c.name),
    ])
  );

  // ---------------------------------------------------------------------------
  // Services CRUD
  // ---------------------------------------------------------------------------
  const handleSeedDefaults = async () => {
    try {
      for (const s of DEFAULT_SERVICES) {
        const id = s.id || doc(collection(db, 'services')).id;
        await setDoc(doc(db, 'services', id), {
          ...s,
          id,
          updatedAt: serverTimestamp(),
        });
      }
      await onLog('Seeded default services', 'service', 'batch', `${DEFAULT_SERVICES.length} services initialized`);
      toast.success('Default services synced to Firestore');
    } catch (err: any) {
      toast.error(err.message || 'Seed failed');
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imgUrl = srvForm.imageUrl;
      if (srvFile) {
        const fileRef = ref(storage, `services/${Date.now()}_${srvFile.name}`);
        await uploadBytes(fileRef, srvFile);
        imgUrl = await getDownloadURL(fileRef);
      }
      const payload = {
        name: srvForm.name.trim(),
        category: srvForm.category,
        price: srvForm.price.trim() || 'On Consultation',
        numericPrice: Number(srvForm.numericPrice) || 0,
        durationMinutes: Number(srvForm.durationMinutes) || 60,
        description: srvForm.description.trim(),
        imageUrl: imgUrl,
        active: srvForm.active,
        featured: srvForm.featured,
        updatedAt: serverTimestamp(),
      };
      if (editingServiceId) {
        await updateDoc(doc(db, 'services', editingServiceId), payload);
        await onLog('Updated service', 'service', editingServiceId, payload.name);
        toast.success('Service updated');
      } else {
        const refDoc = await addDoc(collection(db, 'services'), payload);
        await onLog('Added service', 'service', refDoc.id, payload.name);
        toast.success('Service added');
      }
      setEditingServiceId(null);
      setSrvFile(null);
      setSrvForm({
        name: '',
        category: 'Bridal Makeup',
        price: '',
        numericPrice: '0',
        durationMinutes: '60',
        description: '',
        imageUrl: '',
        active: true,
        featured: false,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save service');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await setDoc(doc(db, 'serviceCategories', slug), {
      name: newCategoryName.trim(),
      slug,
      displayOrder: serviceCategories.length + 1,
      active: true,
    });
    await onLog('Added service category', 'serviceCategory', slug, newCategoryName.trim());
    setNewCategoryName('');
    toast.success('Category added');
  };

  // ---------------------------------------------------------------------------
  // Packages CRUD
  // ---------------------------------------------------------------------------
  const handleSeedPackages = async () => {
    try {
      for (const p of DEFAULT_PACKAGES) {
        const id = p.id || doc(collection(db, 'packages')).id;
        await setDoc(doc(db, 'packages', id), {
          ...p,
          id,
          createdAt: serverTimestamp(),
        });
      }
      await onLog('Seeded default packages', 'package', 'batch', `${DEFAULT_PACKAGES.length} packages synced`);
      toast.success('Default bridal packages synced');
    } catch (err: any) {
      toast.error(err.message || 'Failed to seed packages');
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imgUrl = pkgForm.imageUrl;
      if (pkgFile) {
        const fileRef = ref(storage, `packages/${Date.now()}_${pkgFile.name}`);
        await uploadBytes(fileRef, pkgFile);
        imgUrl = await getDownloadURL(fileRef);
      }
      const payload = {
        name: pkgForm.name.trim(),
        tier: pkgForm.tier,
        price: pkgForm.price.trim() || 'On Consultation',
        numericPrice: Number(pkgForm.numericPrice) || 0,
        includedServices: pkgForm.includedText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        description: pkgForm.description.trim(),
        specialOffer: pkgForm.specialOffer.trim(),
        durationMinutes: Number(pkgForm.durationMinutes) || 180,
        imageUrl: imgUrl,
        active: pkgForm.active,
        createdAt: serverTimestamp(),
      };
      if (editingPackageId) {
        await updateDoc(doc(db, 'packages', editingPackageId), payload);
        await onLog('Updated package', 'package', editingPackageId, payload.name);
        toast.success('Package updated');
      } else {
        const docRef = await addDoc(collection(db, 'packages'), payload);
        await onLog('Created package', 'package', docRef.id, payload.name);
        toast.success('Package created');
      }
      setEditingPackageId(null);
      setPkgFile(null);
      setPkgForm({
        name: '',
        tier: 'Bridal',
        price: '',
        numericPrice: '0',
        includedText: '',
        description: '',
        specialOffer: '',
        durationMinutes: '180',
        imageUrl: '',
        active: true,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save package');
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Gallery CRUD
  // ---------------------------------------------------------------------------
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingGalId) {
        await updateDoc(doc(db, 'gallery', editingGalId), {
          title: galForm.title.trim(),
          category: galForm.category,
          caption: galForm.caption.trim(),
          isActualClientWork: galForm.isActualClientWork,
        });
        await onLog('Updated gallery item', 'gallery', editingGalId, galForm.title);
        toast.success('Gallery item updated');
        setEditingGalId(null);
      } else {
        if (!galFile) {
          toast.error('Please select an image file to upload');
          setUploading(false);
          return;
        }
        const storageRef = ref(storage, `gallery/${Date.now()}_${galFile.name}`);
        await uploadBytes(storageRef, galFile);
        const url = await getDownloadURL(storageRef);
        const docRef = await addDoc(collection(db, 'gallery'), {
          url,
          title: galForm.title.trim(),
          category: galForm.category,
          caption: galForm.caption.trim(),
          isActualClientWork: galForm.isActualClientWork,
          createdAt: serverTimestamp(),
        });
        await onLog('Uploaded gallery photo', 'gallery', docRef.id, galForm.title);
        toast.success('Photo uploaded to gallery');
      }
      setGalFile(null);
      setGalForm({
        title: '',
        category: 'Bridal Makeup',
        caption: '',
        isActualClientWork: true,
      });
    } catch (err: any) {
      toast.error(err.message || 'Gallery upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Offers CRUD
  // ---------------------------------------------------------------------------
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const refDoc = await addDoc(collection(db, 'offers'), {
        title: offForm.title.trim(),
        description: offForm.description.trim(),
        code: offForm.code.trim().toUpperCase(),
        offerType: offForm.offerType,
        discountLabel: offForm.discountLabel.trim(),
        expiryDate: offForm.expiryDate,
        active: offForm.active,
        createdAt: serverTimestamp(),
      });
      await onLog('Created offer', 'offer', refDoc.id, offForm.title);
      toast.success('Offer published');
      setOffForm({
        title: '',
        description: '',
        code: '',
        offerType: 'Discount',
        discountLabel: '',
        expiryDate: '',
        active: true,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add offer');
    }
  };

  if (section === 'services') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Service &amp; Category Management
            </h2>
            <p className="text-xs text-kd-muted">Edit prices, durations, photos, and availability.</p>
          </div>
          {services.length === 0 && (
            <button
              type="button"
              onClick={handleSeedDefaults}
              className="px-4 py-2 rounded-xl border border-kd-rosegold/40 text-xs font-semibold text-kd-pink hover:bg-white/5"
            >
              Sync Default 19 Services to Database
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add/Edit Service Form */}
          <form
            onSubmit={handleSaveService}
            className="lg:col-span-5 bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5 space-y-4 h-fit"
          >
            <h3 className="font-serif text-xl font-semibold text-white">
              {editingServiceId ? 'Edit Service' : 'Add Service'}
            </h3>
            <input
              type="text"
              placeholder="Service Name *"
              value={srvForm.name}
              onChange={(e) => setSrvForm({ ...srvForm, name: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={srvForm.category}
                onChange={(e) => setSrvForm({ ...srvForm, category: e.target.value })}
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={15}
                step={15}
                placeholder="Duration (mins)"
                value={srvForm.durationMinutes}
                onChange={(e) => setSrvForm({ ...srvForm, durationMinutes: e.target.value })}
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Display Price (e.g. ₹10,000 onwards)"
                value={srvForm.price}
                onChange={(e) => setSrvForm({ ...srvForm, price: e.target.value })}
                required
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
              <input
                type="number"
                placeholder="Numeric Price (₹)"
                value={srvForm.numericPrice}
                onChange={(e) => setSrvForm({ ...srvForm, numericPrice: e.target.value })}
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Service description *"
              value={srvForm.description}
              onChange={(e) => setSrvForm({ ...srvForm, description: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-kd-rosegold/40 bg-kd-black text-xs text-kd-muted cursor-pointer">
              <Upload className="w-4 h-4 text-kd-pink" />
              <span>{srvFile ? srvFile.name : 'Upload service photo (optional)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSrvFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <div className="flex items-center gap-5 text-xs text-kd-muted">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={srvForm.active}
                  onChange={(e) => setSrvForm({ ...srvForm, active: e.target.checked })}
                />
                Active
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={srvForm.featured}
                  onChange={(e) => setSrvForm({ ...srvForm, featured: e.target.checked })}
                />
                Featured on Home
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs"
              >
                {uploading ? 'Saving...' : editingServiceId ? 'Update Service' : 'Add Service'}
              </button>
              {editingServiceId && (
                <button
                  type="button"
                  onClick={() => setEditingServiceId(null)}
                  className="px-4 py-2.5 rounded-xl border border-kd-rosegold/30 text-xs text-kd-muted"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Category Quick Add */}
            <div className="pt-4 border-t border-kd-rosegold/20">
              <div className="text-xs font-semibold text-kd-pink mb-2">Add Custom Category</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3.5 py-2 rounded-xl border border-kd-rosegold/40 text-xs font-semibold text-kd-pink"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Services List */}
          <div className="lg:col-span-7 bg-kd-surface border border-kd-rosegold/25 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-kd-rosegold/20 text-[11px] uppercase text-kd-muted">
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price &amp; Mins</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kd-rosegold/10">
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{s.name}</div>
                        <div className="text-[11px] text-kd-muted">
                          {s.active ? 'Enabled' : 'Disabled'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-kd-rosegold">{s.category}</td>
                      <td className="py-3 px-4 tabular-nums">
                        <div className="text-kd-pink font-semibold">{s.price}</div>
                        <div className="text-[11px] text-kd-muted">{s.durationMinutes} mins</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!s.id) return;
                              await updateDoc(doc(db, 'services', s.id), { active: !s.active });
                              toast.success(s.active ? 'Service disabled' : 'Service enabled');
                            }}
                            className="p-1.5 rounded-lg text-kd-muted hover:text-white"
                            title="Toggle Active"
                          >
                            {s.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingServiceId(s.id || null);
                              setSrvForm({
                                name: s.name,
                                category: s.category,
                                price: s.price,
                                numericPrice: String(s.numericPrice || 0),
                                durationMinutes: String(s.durationMinutes || 60),
                                description: s.description,
                                imageUrl: s.imageUrl || '',
                                active: s.active,
                                featured: !!s.featured,
                              });
                            }}
                            className="p-1.5 rounded-lg text-kd-pink hover:bg-white/5"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!s.id) return;
                              await deleteDoc(doc(db, 'services', s.id));
                              await onLog('Deleted service', 'service', s.id, s.name);
                              toast.success('Service deleted');
                            }}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === 'packages') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Bridal Packages</h2>
            <p className="text-xs text-kd-muted">Configure Bridal, Engagement, Pre-Bridal, Guest &amp; Custom suites.</p>
          </div>
          {packages.length === 0 && (
            <button
              type="button"
              onClick={handleSeedPackages}
              className="px-4 py-2 rounded-xl border border-kd-rosegold/40 text-xs font-semibold text-kd-pink"
            >
              Sync Default 5 Packages
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSavePackage}
            className="lg:col-span-5 bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5 space-y-4 h-fit"
          >
            <h3 className="font-serif text-xl font-semibold text-white">
              {editingPackageId ? 'Edit Package' : 'Create Bridal Package'}
            </h3>
            <input
              type="text"
              placeholder="Package Name *"
              value={pkgForm.name}
              onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={pkgForm.tier}
                onChange={(e) => setPkgForm({ ...pkgForm, tier: e.target.value as PackageTier })}
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              >
                <option value="Bridal">Bridal</option>
                <option value="Engagement">Engagement</option>
                <option value="Pre-Bridal">Pre-Bridal</option>
                <option value="Wedding Guest">Wedding Guest</option>
                <option value="Custom">Custom</option>
              </select>
              <input
                type="number"
                placeholder="Duration (mins)"
                value={pkgForm.durationMinutes}
                onChange={(e) => setPkgForm({ ...pkgForm, durationMinutes: e.target.value })}
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Display Price *"
                value={pkgForm.price}
                onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                required
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
              <input
                type="number"
                placeholder="Numeric Price (₹)"
                value={pkgForm.numericPrice}
                onChange={(e) => setPkgForm({ ...pkgForm, numericPrice: e.target.value })}
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Included services (one per line) *"
              value={pkgForm.includedText}
              onChange={(e) => setPkgForm({ ...pkgForm, includedText: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <textarea
              rows={2}
              placeholder="Package description *"
              value={pkgForm.description}
              onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Special offer highlight (optional)"
              value={pkgForm.specialOffer}
              onChange={(e) => setPkgForm({ ...pkgForm, specialOffer: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-kd-rosegold/40 bg-kd-black text-xs text-kd-muted cursor-pointer">
              <Upload className="w-4 h-4 text-kd-pink" />
              <span>{pkgFile ? pkgFile.name : 'Upload package image (optional)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPkgFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs"
            >
              {uploading ? 'Saving...' : editingPackageId ? 'Update Package' : 'Save Package'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            {packages.map((p) => (
              <div
                key={p.id}
                className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-kd-rosegold font-semibold">{p.tier}</div>
                  <h4 className="font-serif text-xl font-bold text-white">{p.name}</h4>
                  <div className="text-sm font-bold text-kd-pink mt-1">{p.price}</div>
                  <p className="text-xs text-kd-muted mt-1">{p.includedServices.join(' · ')}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackageId(p.id || null);
                      setPkgForm({
                        name: p.name,
                        tier: p.tier,
                        price: p.price,
                        numericPrice: String(p.numericPrice || 0),
                        includedText: p.includedServices.join('\n'),
                        description: p.description,
                        specialOffer: p.specialOffer || '',
                        durationMinutes: String(p.durationMinutes || 180),
                        imageUrl: p.imageUrl || '',
                        active: p.active,
                      });
                    }}
                    className="p-2 rounded-lg text-kd-pink hover:bg-white/5"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!p.id) return;
                      await deleteDoc(doc(db, 'packages', p.id));
                      await onLog('Deleted package', 'package', p.id, p.name);
                      toast.success('Package deleted');
                    }}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section === 'gallery') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Gallery &amp; Reviews Moderation
          </h2>
          <p className="text-xs text-kd-muted">Upload real client looks to cloud storage and approve testimonials.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveGallery}
            className="lg:col-span-4 bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5 space-y-4 h-fit"
          >
            <h3 className="font-serif text-xl font-semibold text-white">
              {editingGalId ? 'Edit Gallery Details' : 'Upload Portfolio Photo'}
            </h3>
            <input
              type="text"
              placeholder="Look Title *"
              value={galForm.title}
              onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <select
              value={galForm.category}
              onChange={(e) => setGalForm({ ...galForm, category: e.target.value as GalleryCategory })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            >
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Caption (optional)"
              value={galForm.caption}
              onChange={(e) => setGalForm({ ...galForm, caption: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <label className="flex items-center gap-2 text-xs text-kd-muted cursor-pointer">
              <input
                type="checkbox"
                checked={galForm.isActualClientWork}
                onChange={(e) => setGalForm({ ...galForm, isActualClientWork: e.target.checked })}
              />
              Verified actual client photograph
            </label>
            {!editingGalId && (
              <label className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-dashed border-kd-rosegold/40 bg-kd-black text-xs text-kd-muted cursor-pointer">
                <Upload className="w-4 h-4 text-kd-pink" />
                <span>{galFile ? galFile.name : 'Choose image file *'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setGalFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs"
              >
                {uploading ? 'Uploading...' : editingGalId ? 'Update Item' : 'Publish Photo'}
              </button>
              {editingGalId && (
                <button
                  type="button"
                  onClick={() => setEditingGalId(null)}
                  className="px-3 py-2 rounded-xl border border-kd-rosegold/30 text-xs text-kd-muted"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div
                key={g.id}
                className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="aspect-square bg-kd-black">
                  <img src={g.url} alt={g.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{g.title}</div>
                    <div className="text-[10px] text-kd-rosegold truncate">{g.category}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGalId(g.id || null);
                        setGalForm({
                          title: g.title,
                          category: g.category as GalleryCategory,
                          caption: g.caption || '',
                          isActualClientWork: g.isActualClientWork,
                        });
                      }}
                      className="p-1.5 text-kd-pink hover:bg-white/5 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!g.id) return;
                        await deleteDoc(doc(db, 'gallery', g.id));
                        await onLog('Deleted gallery item', 'gallery', g.id, g.title);
                        toast.success('Photo removed');
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Moderation */}
        <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
          <h3 className="font-serif text-xl font-semibold text-white mb-4">Customer Reviews Moderation</h3>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-kd-black border border-kd-rosegold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <span>{r.name}</span>
                    <span className="inline-flex items-center text-kd-rosegold">
                      <Star className="w-3 h-3 fill-current mr-0.5" />
                      {r.rating}
                    </span>
                    <span className={r.approved ? 'text-emerald-400' : 'text-amber-400'}>
                      {r.approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                  <p className="text-xs text-kd-muted mt-1">{r.comment}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!r.id) return;
                      await updateDoc(doc(db, 'reviews', r.id), { approved: !r.approved });
                      await onLog(r.approved ? 'Hid review' : 'Approved review', 'review', r.id, r.name);
                      toast.success(r.approved ? 'Review hidden' : 'Review approved');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-kd-rosegold/40 text-xs text-kd-pink"
                  >
                    {r.approved ? 'Hide' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!r.id) return;
                      await deleteDoc(doc(db, 'reviews', r.id));
                      toast.success('Review deleted');
                    }}
                    className="p-1.5 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Offers section
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Offers &amp; Promotions</h2>
        <p className="text-xs text-kd-muted">Create discount campaigns, festival deals, and coupon codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSaveOffer}
          className="lg:col-span-5 bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5 space-y-4 h-fit"
        >
          <h3 className="font-serif text-xl font-semibold text-white">Create Promotion</h3>
          <input
            type="text"
            placeholder="Offer Title *"
            value={offForm.title}
            onChange={(e) => setOffForm({ ...offForm, title: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={offForm.offerType}
              onChange={(e) => setOffForm({ ...offForm, offerType: e.target.value as OfferType })}
              className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            >
              <option value="Discount">Discount</option>
              <option value="Festival">Festival</option>
              <option value="Bridal Special">Bridal Special</option>
              <option value="Limited Time">Limited Time</option>
            </select>
            <input
              type="text"
              placeholder="Highlight (e.g. 15% Off)"
              value={offForm.discountLabel}
              onChange={(e) => setOffForm({ ...offForm, discountLabel: e.target.value })}
              className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Coupon Code (optional)"
              value={offForm.code}
              onChange={(e) => setOffForm({ ...offForm, code: e.target.value.toUpperCase() })}
              className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white font-mono uppercase"
            />
            <input
              type="date"
              value={offForm.expiryDate}
              onChange={(e) => setOffForm({ ...offForm, expiryDate: e.target.value })}
              className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <textarea
            rows={3}
            placeholder="Offer details *"
            value={offForm.description}
            onChange={(e) => setOffForm({ ...offForm, description: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs"
          >
            Publish Offer
          </button>
        </form>

        <div className="lg:col-span-7 space-y-3">
          {offers.map((o) => (
            <div
              key={o.id}
              className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5 flex items-start justify-between gap-4"
            >
              <div>
                <div className="text-[11px] text-kd-rosegold">
                  {o.offerType} {o.code ? `· Code: ${o.code}` : ''}
                </div>
                <h4 className="font-serif text-xl font-bold text-white">{o.title}</h4>
                <p className="text-xs text-kd-muted mt-1">{o.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    if (!o.id) return;
                    await updateDoc(doc(db, 'offers', o.id), { active: !o.active });
                    toast.success(o.active ? 'Offer paused' : 'Offer activated');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-kd-rosegold/40 text-xs text-kd-pink inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {o.active ? 'Active' : 'Inactive'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!o.id) return;
                    await deleteDoc(doc(db, 'offers', o.id));
                    toast.success('Offer deleted');
                  }}
                  className="p-1.5 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
