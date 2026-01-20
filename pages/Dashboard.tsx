import React, { useState, useEffect } from 'react';
import { PropertyService, BookingService } from '../services/storage';
import { Property, Booking } from '../types';
import PropertyModal from '../components/PropertyModal';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, AlertTriangle, Calendar, Check, X, Clock, Building2, CalendarDays, Home, LayoutList, Phone, ChevronRight, Download, Save } from 'lucide-react';
import { MOCK_USER } from '../constants';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings'>('properties');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete Confirmation State
  const [propertyToDelete, setPropertyToDelete] = useState<{id: string, title: string} | null>(null);

  // Load properties for the logged-in user
  const loadData = () => {
    const props = PropertyService.getByOwner(MOCK_USER.id);
    setMyProperties(props);
    
    // In a real backend, we would filter bookings where property.ownerId == currentUser
    const bookings = BookingService.getAll().sort((a, b) => b.createdAt - a.createdAt);
    setMyBookings(bookings);
  };

  useEffect(() => {
    // Security Check: If owner mode is not enabled, redirect to home
    const isOwner = localStorage.getItem('airhome_owner_mode') === 'true';
    if (!isOwner) {
        navigate('/');
        return;
    }

    loadData();
    
    try {
        const activeModalState = localStorage.getItem('airhome_modal_active'); 
        if (activeModalState) {
            if (activeModalState === 'new') {
                setEditingProperty(null);
                setIsModalOpen(true);
            } else if (activeModalState.startsWith('edit:')) {
                const id = activeModalState.split(':')[1];
                const property = PropertyService.getById(id);
                if (property) {
                    setEditingProperty(property);
                    setIsModalOpen(true);
                }
            }
        }
    } catch (e) {
        console.error("Error restoring modal state", e);
    }
  }, [navigate]);

  const handleSave = (property: Property) => {
    PropertyService.save(property);
    setIsModalOpen(false);
    setEditingProperty(null);
    localStorage.removeItem('airhome_modal_active'); 
    loadData();
    
    // Simple visual feedback
    const toast = document.createElement('div');
    toast.innerHTML = '<div class="flex items-center gap-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> تم حفظ التعديلات بنجاح</div>';
    toast.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#10B981;color:white;padding:12px 24px;border-radius:50px;z-index:9999;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;";
    document.body.appendChild(toast);
    setTimeout(() => {
        if (document.body.contains(toast)) document.body.removeChild(toast);
    }, 3000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
    localStorage.removeItem('airhome_modal_active');
  };

  const initiateDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setPropertyToDelete({ id, title });
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      PropertyService.delete(propertyToDelete.id);
      loadData();
      setPropertyToDelete(null);
    }
  };

  const cancelDelete = () => {
    setPropertyToDelete(null);
  };

  const handleEdit = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    setEditingProperty(property);
    setIsModalOpen(true);
    localStorage.setItem('airhome_modal_active', `edit:${property.id}`); 
  };

  const handleAddNew = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
    localStorage.setItem('airhome_modal_active', 'new');
  };

  const toggleStatus = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    const newStatus = property.status === 'published' ? 'hidden' : 'published';
    PropertyService.save({ ...property, status: newStatus });
    loadData();
  };
  
  // New feature: Download Backup
  const handleDownloadBackup = () => {
      const data = PropertyService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `airhome_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleBookingAction = (id: string, action: 'confirmed' | 'rejected') => {
      BookingService.updateStatus(id, action);
      loadData();
  };

  const filteredProperties = myProperties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">لوحة التحكم</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">أدر عقاراتك وحجوزاتك وأرباحك.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
             <button
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-semibold transition shadow-sm"
              title="تنزيل نسخة احتياطية من البيانات"
            >
              <Download size={20} />
              <span className="hidden sm:inline">نسخة احتياطية</span>
            </button>
            <button
              onClick={handleAddNew}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#FF385C] hover:bg-[#d9324e] text-white px-5 py-3 rounded-xl font-semibold transition shadow-sm hover:shadow-md active:scale-95"
            >
              <Plus size={20} />
              أضف عقار جديد
            </button>
        </div>
      </div>

      {/* Stats Cards - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 md:grid md:grid-cols-3 md:mx-0 md:px-0 no-scrollbar">
          <div className="min-w-[240px] bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between group">
              <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">إجمالي العقارات</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900">{myProperties.length}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  <Home size={20} />
              </div>
          </div>
          <div className="min-w-[240px] bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between group">
              <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">نشط ومنشور</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">{myProperties.filter(p => p.status === 'published').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <Eye size={20} />
              </div>
          </div>
          <div className="min-w-[240px] bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between group">
              <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">مخفي</p>
                  <p className="text-2xl font-bold mt-1 text-gray-400">{myProperties.filter(p => p.status === 'hidden').length}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <EyeOff size={20} />
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b">
         <button 
           onClick={() => setActiveTab('properties')}
           className={`flex items-center gap-2 pb-3 px-2 font-medium text-sm transition relative ${
             activeTab === 'properties' 
               ? 'text-black' 
               : 'text-gray-500 hover:text-gray-800'
           }`}
         >
            <Building2 size={18} />
            <span>العقارات</span>
            {activeTab === 'properties' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></span>}
         </button>
         <button 
           onClick={() => setActiveTab('bookings')}
           className={`flex items-center gap-2 pb-3 px-2 font-medium text-sm transition relative ${
             activeTab === 'bookings' 
               ? 'text-black' 
               : 'text-gray-500 hover:text-gray-800'
           }`}
         >
            <CalendarDays size={18} />
            <span>الحجوزات</span>
            {myBookings.some(b => b.status === 'pending') && (
                <span className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0"></span>
            )}
            {activeTab === 'bookings' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full"></span>}
         </button>
      </div>

      {activeTab === 'properties' ? (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                type="text"
                placeholder="ابحث في العقارات..."
                className="w-full ps-9 pe-4 py-3 border rounded-xl text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredProperties.length === 0 ? (
                <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                    {searchTerm ? 'لا توجد عقارات تطابق بحثك.' : 'ليس لديك أي عقارات مدرجة.'}
                </div>
            ) : (
                <>
                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-start border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                            <th className="px-6 py-4 text-start">العقار</th>
                            <th className="px-6 py-4 text-start">الحالة</th>
                            <th className="px-6 py-4 text-start">السعر</th>
                            <th className="px-6 py-4 text-end">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProperties.map((property) => (
                            <tr key={property.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <img src={property.images?.[0]} alt="" className="h-12 w-12 rounded-lg object-cover bg-gray-200 border" />
                                    <div>
                                    <div className="font-semibold text-gray-900">{property.title}</div>
                                    <div className="text-xs text-gray-500">{property.location}</div>
                                    </div>
                                </div>
                                </td>
                                <td className="px-6 py-4">
                                <button onClick={(e) => toggleStatus(e, property)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${property.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                    {property.status === 'published' ? 'منشور' : 'مخفي'}
                                </button>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-700">{property.price} د.م</td>
                                <td className="px-6 py-4 text-end">
                                <div className="flex items-center justify-end gap-3">
                                    <button onClick={(e) => handleEdit(e, property)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"><Pencil size={16} /></button>
                                    <button onClick={(e) => initiateDelete(e, property.id, property.title)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 size={16} /></button>
                                </div>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                    {filteredProperties.map((property) => (
                        <div key={property.id} className="bg-white p-4 rounded-xl border shadow-sm flex gap-4 items-start" onClick={(e) => handleEdit(e, property)}>
                            <img src={property.images?.[0]} alt="" className="w-20 h-20 rounded-lg object-cover bg-gray-200 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                                    <button onClick={(e) => initiateDelete(e, property.id, property.title)} className="text-gray-400 hover:text-red-500 p-1 -mt-1 -mr-1"><Trash2 size={16} /></button>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{property.location}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-bold text-gray-900">{property.price} د.م</span>
                                    <button 
                                        onClick={(e) => toggleStatus(e, property)}
                                        className={`text-[10px] px-2 py-0.5 rounded-full border ${property.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                                    >
                                        {property.status === 'published' ? 'منشور' : 'مخفي'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}
        </div>
      ) : (
        /* --- BOOKINGS TAB --- */
        <div className="space-y-4">
            {myBookings.length === 0 ? (
                <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-3 bg-gray-50 rounded-xl border border-dashed">
                    <Calendar size={32} className="text-gray-400 opacity-50" />
                    <p className="font-medium">لا توجد حجوزات حتى الآن</p>
                </div>
            ) : (
                <>
                {/* Desktop View */}
                <div className="hidden md:block bg-white border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-start border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4 text-start">العقار</th>
                                <th className="px-6 py-4 text-start">الضيف</th>
                                <th className="px-6 py-4 text-start">التواريخ</th>
                                <th className="px-6 py-4 text-start">السعر</th>
                                <th className="px-6 py-4 text-start">الحالة</th>
                                <th className="px-6 py-4 text-end">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {myBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{booking.propertyTitle}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900 font-medium">{booking.guestName}</div>
                                        {booking.guestPhone && <div className="text-xs text-gray-500 mt-1">{booking.guestPhone}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-green-600">{booking.startDate}</span>
                                            <span className="text-gray-400 text-xs">إلى</span>
                                            <span className="text-red-500">{booking.endDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold">{booking.totalPrice} د.م</td>
                                    <td className="px-6 py-4">
                                        {booking.status === 'pending' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">انتظار</span>}
                                        {booking.status === 'confirmed' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">مؤكد</span>}
                                        {booking.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">مرفوض</span>}
                                    </td>
                                    <td className="px-6 py-4 text-end">
                                        {booking.status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleBookingAction(booking.id, 'confirmed')} className="p-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><Check size={16} /></button>
                                                <button onClick={() => handleBookingAction(booking.id, 'rejected')} className="p-1.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><X size={16} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                    {myBookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-900 line-clamp-1">{booking.propertyTitle}</h3>
                                {booking.status === 'pending' && <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">جديد</span>}
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">{booking.guestName[0]}</div>
                                <div>
                                    <div className="font-medium text-gray-900">{booking.guestName}</div>
                                    <a href={`tel:${booking.guestPhone}`} className="text-xs text-blue-600">{booking.guestPhone}</a>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="block text-gray-400 mb-1">الوصول</span>
                                    <span className="font-medium text-gray-800">{booking.startDate}</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="block text-gray-400 mb-1">المغادرة</span>
                                    <span className="font-medium text-gray-800">{booking.endDate}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3 mt-2">
                                <span className="font-bold text-lg">{booking.totalPrice} د.م</span>
                                
                                {booking.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleBookingAction(booking.id, 'rejected')} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold">رفض</button>
                                        <button onClick={() => handleBookingAction(booking.id, 'confirmed')} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold shadow-sm">قبول</button>
                                    </div>
                                ) : (
                                    <span className={`text-xs font-bold ${booking.status === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>
                                        {booking.status === 'confirmed' ? 'تم التأكيد' : 'مرفوض'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}
        </div>
      )}

      <PropertyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingProperty}
      />

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
                 <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 mb-2">حذف العقار؟</h3>
                 <p className="text-gray-500 mb-6 text-sm">
                    هل أنت متأكد من حذف "{propertyToDelete.title}"؟ لا يمكن التراجع عن هذا.
                 </p>
                 <div className="flex gap-3">
                    <button onClick={cancelDelete} className="flex-1 py-2.5 rounded-xl border font-semibold text-sm">إلغاء</button>
                    <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm">حذف</button>
                 </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;