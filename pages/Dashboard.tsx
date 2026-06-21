import React, { useState, useEffect } from 'react';
import { PropertyService, BookingService } from '../services/storage';
import { Property, Booking } from '../types';
import PropertyModal from '../components/PropertyModal';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Calendar, Check, X, UserCircle, MapPin, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings'>('properties');
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [propertyToDelete, setPropertyToDelete] = useState<{id: string, title: string} | null>(null);

  useEffect(() => {
    const isOwner = localStorage.getItem('airhome_owner_mode') === 'true';
    if (!isOwner) {
        navigate('/');
        return;
    }

    if (!user) return;

    const unsubscribeProps = PropertyService.subscribeByOwner(user.uid, (data) => {
      setMyProperties(data);
    });

    const unsubscribeBookings = BookingService.subscribeByPropertyOwner(user.uid, (data) => {
      setMyBookings(data.sort((a, b) => b.createdAt - a.createdAt));
    });
    
    return () => {
      unsubscribeProps();
      unsubscribeBookings();
    };
  }, [navigate, user]);

  const handleSave = (property: Property) => {
    const propertyToSave = { ...property, ownerId: user?.uid || property.ownerId };
    PropertyService.save(propertyToSave);
    setIsModalOpen(false);
    setEditingProperty(null);
    showToast('تم حفظ التعديلات بنجاح', 'success');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
  };

  const initiateDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setPropertyToDelete({ id, title });
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      PropertyService.delete(propertyToDelete.id);
      setPropertyToDelete(null);
      showToast('تم حذف العقار', 'info');
    }
  };

  const handleEdit = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const toggleStatus = (e: React.MouseEvent, property: Property) => {
    e.stopPropagation();
    const newStatus = property.status === 'published' ? 'hidden' : 'published';
    PropertyService.save({ ...property, status: newStatus });
    showToast(newStatus === 'published' ? 'تم نشر العقار' : 'تم إخفاء العقار', 'info');
  };
  
  const handleDownloadBackup = async () => {
      try {
          const data = await PropertyService.exportData();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `airhome_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('تم تحميل النسخة الاحتياطية بنجاح', 'success');
      } catch (error) {
          showToast('فشل تحميل النسخة الاحتياطية', 'error');
      }
  };

  const handleBookingAction = (id: string, action: 'confirmed' | 'rejected') => {
      BookingService.updateStatus(id, action);
      showToast(action === 'confirmed' ? 'تم تأكيد الحجز' : 'تم إلغاء الحجز', 'info');
  };

  const filteredProperties = myProperties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">أدر عقاراتك وحجوزاتك بسهولة.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
             <button
               onClick={() => window.location.reload()}
               className="flex items-center justify-center p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition shadow-sm"
               title="تحديث الصفحة"
             >
               <RefreshCw size={18} />
             </button>
             <button
               onClick={handleDownloadBackup}
               className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition shadow-sm"
             >
               <Download size={18} />
               <span>نسخة احتياطية</span>
             </button>
             <button
               onClick={handleAddNew}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-sm active:scale-95"
             >
               <Plus size={20} />
               أضف عقار جديد
             </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'properties' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          عقاراتي ({myProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          الحجوزات ({myBookings.length})
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'properties' ? (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="البحث في عقاراتي..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredProperties.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">لا توجد عقارات حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                    <div className="relative h-48">
                      <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button 
                          onClick={(e) => toggleStatus(e, property)}
                          className={`p-2 rounded-lg backdrop-blur-md transition-colors ${property.status === 'published' ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'}`}
                        >
                          {property.status === 'published' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg truncate">{property.title}</h3>
                        <span className="text-sm font-bold text-[#FF385C]">{property.price} درهم</span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} />
                        {property.location}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={(e) => handleEdit(e, property)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Pencil size={14} />
                          تعديل
                        </button>
                        <button 
                          onClick={(e) => initiateDelete(e, property.id, property.title)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">لا توجد حجوزات حالياً.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img src={booking.propertyImage} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{booking.propertyTitle}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {booking.checkIn} - {booking.checkOut}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                            <UserCircle size={12} />
                            {booking.guestName}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status === 'confirmed' ? 'مؤكد' : booking.status === 'rejected' ? 'ملغي' : 'قيد الانتظار'}
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 ml-auto md:ml-0">
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'confirmed')}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'rejected')}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <PropertyModal
          isOpen={isModalOpen}
          initialData={editingProperty}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

      {propertyToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold">تأكيد الحذف</h3>
            <p className="text-gray-500">هل أنت متأكد من حذف "{propertyToDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
              <button 
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
