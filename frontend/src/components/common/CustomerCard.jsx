import React, { useContext } from "react";
import { FiInfo } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaRegEdit } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

export default function CustomerCard({
  id,
  name,
  phone,
  device,
  warranty,
  model,
  cost,
  received,
  delivery,
  type,
  invoice,
  onInfo,
  onEdit,
  onDelete,
}) {
  const { user } = useContext(AuthContext);
  if (!user) return null; // or return a placeholder

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // handle empty

    // Handle dd/mm/yyyy format
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
    }

    // If it's in ISO format or valid for Date()
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A"; // still invalid

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };


  return (
    <div className="text-white rounded-lg mb-5 custom-table-header-div">
      {/* Header */}
      <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center custom-table-header mb-3">
        <h3 className="font-bold break-words">{name}</h3>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 flex-wrap">
          <div className="text-xs invoice-number mb-1 md:mb-0 break-words">
            Invoice Number: <strong>{invoice}</strong>
          </div>

          {(user.user_type && user.user_type == 1 ?
            <div className="flex gap-2 flex-wrap">
              <div className="custom-table-header-icon" onClick={onInfo}>
                <FiInfo />
              </div>
              <div className="custom-table-header-icon" onClick={onDelete}>
                <RiDeleteBin5Line />
              </div>
              <div className="custom-table-header-icon" onClick={onEdit}>
                <FaRegEdit />
              </div>
            </div>
            :
            ""
          )}


        </div>
      </div>

      {/* Body */}
      <div
        className={`custom-table-body grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-4 text-sm ${user.user_type !== 1 ? "nocopy" : ""
          }`}
        onContextMenu={user.user_type !== 1 ? (e) => e.preventDefault() : undefined}
      >        
      <div className="break-words">Phone Number: <span>{phone}</span></div>
        <div className="break-words">Device Type: <span>{device}</span></div>
        <div className="break-words">Warranty: <span className="text-green-400">{warranty}</span></div>
        <div className="break-words">Model: <span>{model}</span></div>
        <div className="break-words">Cost: <span>{cost}</span></div>
        <div className="break-words">Received Date: <span>{formatDate(received)}</span></div>
        <div className="break-words">Delivery Date: <span>{formatDate(delivery)}</span></div>
        <div className="break-words">Repair Type: <span>{type}</span></div>
      </div>
    </div>
  );
}
