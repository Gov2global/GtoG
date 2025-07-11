"use client";
import React, { useEffect, useState } from "react";
import { ModernSelect } from "../../../components/ui/select";
import ModernInput from "../components/ui/Input";

export default function AddressSelect({ value, onChange }) {
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [subDistrictList, setSubDistrictList] = useState([]);
  const [postcode, setPostcode] = useState("");

  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then(res => res.json())
      .then(json => setProvinceList(json.data?.map(p => ({ value: p.province, label: p.province })) || []));
  }, []);

  useEffect(() => {
    if (value.province) {
      fetch(`/api/farmer/get/district?province=${encodeURIComponent(value.province)}`)
        .then(res => res.json())
        .then(json => setDistrictList(json.data?.map(d => ({ value: d.district, label: d.district })) || []));
    } else {
      setDistrictList([]);
    }
  }, [value.province]);

  useEffect(() => {
    if (value.district) {
      fetch(`/api/farmer/get/subdistrict?province=${encodeURIComponent(value.province)}&district=${encodeURIComponent(value.district)}`)
        .then(res => res.json())
        .then(json => setSubDistrictList(json.data?.map(s => ({ value: s.sub_district, label: s.sub_district })) || []));
    } else {
      setSubDistrictList([]);
    }
  }, [value.district]);

  useEffect(() => {
    if (value.sub_district) {
      fetch(`/api/farmer/get/postcode?province=${encodeURIComponent(value.province)}&district=${encodeURIComponent(value.district)}&subdistrict=${encodeURIComponent(value.sub_district)}`)
        .then(res => res.json())
        .then(json => {
          setPostcode(json.data?.postcode || "");
          onChange({ ...value, postcode: json.data?.postcode || "" });
        });
    } else {
      setPostcode("");
      onChange({ ...value, postcode: "" });
    }
  }, [value.sub_district]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
      <ModernSelect
        label="จังหวัด"
        value={value.province}
        onChange={province => onChange({ province, district: "", sub_district: "", postcode: "" })}
        options={provinceList}
      />
      <ModernSelect
        label="อำเภอ"
        value={value.district}
        onChange={district => onChange({ ...value, district, sub_district: "", postcode: "" })}
        options={districtList}
      />
      <ModernSelect
        label="ตำบล"
        value={value.sub_district}
        onChange={sub_district => onChange({ ...value, sub_district, postcode: "" })}
        options={subDistrictList}
      />
      <ModernInput
        label="รหัสไปรษณีย์"
        name="postcode"
        value={postcode || value.postcode || ""}
        onChange={e => onChange({ ...value, postcode: e.target.value })}
      />
    </div>
  );
}
