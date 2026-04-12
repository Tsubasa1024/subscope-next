"use client";

import { useTransition, useState } from "react";
import { createService, updateService } from "../actions";

type Category = { id: number; name: string; slug: string };

type ServiceData = {
  id: string;
  name: string;
  slug: string;
  category_id: number | null;
  description: string | null;
  website_url: string | null;
  affiliate_url: string | null;
  logo_url: string | null;
  is_featured: boolean;
  is_active: boolean;
};

type Props = {
  categories: Category[];
  service?: ServiceData;
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#1d1d1f",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d1d1d6",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1d1d1f",
  boxSizing: "border-box",
  outline: "none",
};

const fieldStyle: React.CSSProperties = {
  marginBottom: "20px",
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/^-+|-+$/g, "");
}

export function ServiceForm({ categories, service }: Props) {
  const isEdit = !!service;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState(service?.name ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateService(service.id, formData);
        } else {
          await createService(formData);
        }
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fff0f0",
            color: "#e53e3e",
            fontSize: "0.875rem",
            border: "1px solid #fed7d7",
          }}
        >
          {error}
        </div>
      )}

      {/* サービス名 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>
          サービス名 <span style={{ color: "#e53e3e" }}>*</span>
        </label>
        <input
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          placeholder="例: Netflix"
        />
      </div>

      {/* スラッグ */}
      <div style={fieldStyle}>
        <label style={labelStyle}>
          スラッグ <span style={{ color: "#e53e3e" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="例: netflix"
          />
          <button
            type="button"
            onClick={() => setSlug(toSlug(name))}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #d1d1d6",
              background: "#f5f5f7",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              color: "#1d1d1f",
            }}
          >
            自動生成
          </button>
        </div>
        <p style={{ fontSize: "0.75rem", color: "#86868b", marginTop: "4px" }}>
          URLに使用されます（小文字英数字・ハイフンのみ）
        </p>
      </div>

      {/* カテゴリ */}
      <div style={fieldStyle}>
        <label style={labelStyle}>カテゴリ</label>
        <select
          name="category_id"
          defaultValue={service?.category_id ?? ""}
          style={{ ...inputStyle, cursor: "pointer" }}
        >
          <option value="">カテゴリなし</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 説明 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>説明</label>
        <textarea
          name="description"
          defaultValue={service?.description ?? ""}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="サービスの説明を入力してください"
        />
      </div>

      {/* 2カラムフィールド */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label style={labelStyle}>ウェブサイトURL</label>
          <input
            name="website_url"
            type="url"
            defaultValue={service?.website_url ?? ""}
            style={inputStyle}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label style={labelStyle}>アフィリエイトURL</label>
          <input
            name="affiliate_url"
            type="url"
            defaultValue={service?.affiliate_url ?? ""}
            style={inputStyle}
            placeholder="https://affiliate.example.com"
          />
        </div>
      </div>

      {/* ロゴURL */}
      <div style={fieldStyle}>
        <label style={labelStyle}>ロゴURL</label>
        <input
          name="logo_url"
          type="url"
          defaultValue={service?.logo_url ?? ""}
          style={inputStyle}
          placeholder="https://example.com/logo.png"
        />
      </div>

      {/* チェックボックス */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          marginBottom: "32px",
          padding: "16px",
          background: "#f5f5f7",
          borderRadius: "12px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <input
            name="is_featured"
            type="checkbox"
            defaultChecked={service?.is_featured ?? false}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          注目サービス（is_featured）
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={service?.is_active ?? true}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          有効（is_active）
        </label>
      </div>

      {/* ボタン */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: "12px 28px",
            borderRadius: "10px",
            background: isPending ? "#86868b" : "#1d1d1f",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.875rem",
            border: "none",
            cursor: isPending ? "wait" : "pointer",
          }}
        >
          {isPending ? "保存中..." : isEdit ? "変更を保存" : "サービスを追加"}
        </button>
        <a
          href="/admin/services"
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            background: "#f0f0f2",
            color: "#1d1d1f",
            fontWeight: 500,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
