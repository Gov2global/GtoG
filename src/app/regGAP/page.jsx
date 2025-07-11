// "use client";
// import React, { useState } from "react";
// import ModernInput from "./components/ui/Input";
// import AddressSelect from "./components/AddressSelect";
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
// import { Button } from "../../components/ui/button";
// import { Leaf, MapPin, User, FileText, ListChecks } from "lucide-react";

// function RegisterGAPpage() {
//   const [address, setAddress] = useState({
//     province: "",
//     district: "",
//     sub_district: "",
//     postcode: "",
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-amber-50 flex items-center justify-center py-6">
//       <Card className="w-full max-w-2xl rounded-2xl shadow-lg border-0">
//         <CardHeader>
//           <div className="flex gap-3 items-center">
//             <Leaf className="text-green-600" size={32} />
//             <CardTitle className="text-2xl font-bold text-green-700">
//               ลงทะเบียนเกษตรกร GAP
//             </CardTitle>
//           </div>
//           <p className="text-muted-foreground mt-2">
//             กรุณากรอกข้อมูลตามความเป็นจริง เพื่อประโยชน์ในการเข้าร่วมโครงการ
//           </p>
//         </CardHeader>
//         <CardContent>
//           {/* Personal Info */}
//           <section className="mb-4">
//             <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 text-green-800">
//               <User size={18} /> ข้อมูลส่วนตัว
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <ModernInput label="ชื่อ" name="regName" required />
//               <ModernInput label="นามสกุล" name="regSurname" required />
//               <ModernInput label="เบอร์โทรศัพท์" name="regTel" type="tel" />
//               <ModernInput label="Line ID" name="regLineID" />
//             </div>
//           </section>
//           {/* Farm Info */}
//           <section className="mb-4">
//             <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 text-lime-800">
//               <MapPin size={18} /> ข้อมูลฟาร์ม
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <ModernInput label="ชื่อฟาร์ม" name="farmName" />
//               <ModernInput label="ชนิดพืชที่ปลูก (คั่นด้วย , )" name="fruitType" />
//               <div className="col-span-2">
//                 <AddressSelect value={address} onChange={setAddress} />
//               </div>
//               <ModernInput label="รายละเอียดที่อยู่" name="addressDetail" />
//               <ModernInput label="ลิงก์แผนที่ (Google Map)" name="urlMAP" />
//             </div>
//           </section>
//           {/* Document */}
//           <section className="mb-4">
//             <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 text-amber-800">
//               <FileText size={18} /> เอกสารประกอบ
//             </h3>
//             <ModernInput label="ลิงก์เอกสาร (ถ้ามี, ใส่ , คั่น)" name="document" />
//             <ModernInput label="ลิงก์เอกสารอื่นๆ" name="documentOther" />
//           </section>
//           {/* Demand */}
//           <section className="mb-6">
//             <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 text-sky-800">
//               <ListChecks size={18} /> ความต้องการของเกษตรกร
//             </h3>
//             <ModernInput label="สิ่งที่ต้องการ (ใส่ , คั่น)" name="demandFarmer" />
//           </section>
//           <Button type="submit" className="w-full bg-gradient-to-r from-green-500 via-lime-400 to-amber-300 text-white font-bold text-lg shadow-md hover:scale-105 transition">
//             ลงทะเบียน
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default RegisterGAPpage;
