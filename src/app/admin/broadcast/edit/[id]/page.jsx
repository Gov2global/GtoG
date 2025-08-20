'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditBroadcastPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sendAt, setSendAt] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [messageType, setMessageType] = useState('text');
  const [textMessage, setTextMessage] = useState('');
  const [altText, setAltText] = useState('');
  const [flexData, setFlexData] = useState({
    title: '',
    'การปฏิบัติงาน': '',
    'การให้น้ำ': '',
    'การให้ปุ๋ย': '',
    'โรค': '',
    'แมลง': ''
  });

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/broadcast/${id}`);
        const json = await res.json();
        if (!res.ok || !json.item) throw new Error(json.error || 'ไม่พบข้อมูล');
        const item = json.item;
        setSendAt(item.sendAt ? item.sendAt.slice(0, 16) : '');
        setTargetType(item.targetType || 'all');
        setMessageType(item.messageType || 'text');
        setTextMessage(item.message || '');
        setAltText(item.altText || '');
        setFlexData({
          title: item.flexData?.title || '',
          'การปฏิบัติงาน': item.flexData?.['การปฏิบัติงาน'] || '',
          'การให้น้ำ': item.flexData?.['การให้น้ำ'] || '',
          'การให้ปุ๋ย': item.flexData?.['การให้ปุ๋ย'] || '',
          'โรค': item.flexData?.['โรค'] || '',
          'แมลง': item.flexData?.['แมลง'] || ''
        });
      } catch (e) {
        toast.error('❌ ' + e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        sendAt,
        targetType,
        messageType,
        ...(messageType === 'text' && { message: textMessage }),
        ...(messageType === 'flex' && { flexData, altText })
      };

      const res = await fetch(`/api/admin/broadcast/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'บันทึกไม่สำเร็จ');
      toast.success('✅ แก้ไขสำเร็จ');
      router.push('/admin/broadcast');
    } catch (e) {
      toast.error('❌ ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!id) return <div className="p-4 text-red-500">Invalid ID</div>;
  if (loading) return <div className="p-4 text-gray-600">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <ToastContainer position="top-center" />
      <h1 className="text-xl font-semibold">แก้ไข Broadcast — ID: {id}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>เวลาส่ง</Label>
          <Input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} required />
        </div>
        <div>
          <Label>กลุ่มเป้าหมาย</Label>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="staff">staff</SelectItem>
              <SelectItem value="user">user</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>ประเภทข้อความ</Label>
          <Select value={messageType} onValueChange={setMessageType}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="flex">Flex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {messageType === 'text' ? (
          <div>
            <Label>ข้อความ</Label>
            <Textarea value={textMessage} onChange={(e) => setTextMessage(e.target.value)} rows={4} />
          </div>
        ) : (
          <>
            <div>
              <Label>ข้อความสำรอง (altText)</Label>
              <Input value={altText} onChange={(e) => setAltText(e.target.value)} />
            </div>
            {Object.entries(flexData).map(([key, value]) => (
              <div key={key}>
                <Label>{key}</Label>
                <Input value={value} onChange={(e) => setFlexData((prev) => ({ ...prev, [key]: e.target.value }))} />
              </div>
            ))}
          </>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>ย้อนกลับ</Button>
          <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
        </div>
      </form>
    </div>
  );
}
