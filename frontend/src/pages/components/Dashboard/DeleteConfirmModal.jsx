import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, transactionDescription, amount, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                        Delete Transaction?
                    </h2>
                    <p className="text-gray-500 text-center font-semibold mb-4">
                        This action cannot be undone.
                    </p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <p className="text-sm font-bold text-gray-600 mb-1">Transaction Details:</p>
                        <p className="font-bold text-gray-800">{transactionDescription}</p>
                        {amount && (
                            <p className="text-lg font-bold text-gray-800 mt-1">₹{amount.toLocaleString('en-IN')}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
