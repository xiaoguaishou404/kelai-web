"use client";

import { useState, type ReactNode } from "react";
import { Plus, Search } from "lucide-react";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { useConsoleAccess } from "@/components/enterprise/console-access";
import type { CatalogEntityMap } from "@/lib/enterprise-workspace/types";

export type CatalogOption = string | { value: string | number; label: string };

export interface CatalogField<T> {
  key: keyof T;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "date" | "tags";
  options?: CatalogOption[];
  wide?: boolean;
}

export interface CatalogColumn<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => ReactNode;
}

export function PanelTitle({ title, description }: { title: string; description?: string }) {
  const { pageTitle } = useConsoleAccess();
  return (
    <div>
      {title !== pageTitle && <h3>{title}</h3>}
      {description && <p>{description}</p>}
    </div>
  );
}

export function CatalogPanel<T extends { id: string }>({
  entity,
  title,
  description,
  items,
  fields,
  columns,
  blank,
  onSave,
}: {
  entity: keyof CatalogEntityMap;
  title: string;
  description: string;
  items: T[];
  fields: CatalogField<T>[];
  columns: CatalogColumn<T>[];
  blank: () => T;
  onSave?: (item: T) => void;
}) {
  const { saveCatalogItem } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [draft, setDraft] = useState<T | null>(null);
  const [query, setQuery] = useState("");
  const rows = items.filter((item) =>
    `${JSON.stringify(item)}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const update = (field: CatalogField<T>, value: string) => {
    setDraft((current) =>
      current
        ? ({
            ...current,
            [field.key]: field.type === "number"
              ? Number(value)
              : field.type === "tags"
                ? value.split(/[，,]/).map((item) => item.trim()).filter(Boolean)
                : value,
          } as T)
        : current,
    );
  };
  const save = () => {
    if (!draft) return;
    if (onSave) onSave(draft);
    else saveCatalogItem(entity, draft as unknown as CatalogEntityMap[typeof entity]);
    setDraft(null);
  };
  return (
    <section className="ep-catalog-panel">
      <div className="ep-catalog-head">
        <PanelTitle title={title} description={description} />
        <div className="ep-catalog-head-actions">
          <span>{items.length} 条</span>
          {!readOnly && (
            <button className="ep-button" onClick={() => setDraft(blank())}>
              <Plus size={15} />新建
            </button>
          )}
        </div>
      </div>
      <div className="ep-catalog-toolbar">
        <label className="ep-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`搜索${title}`}
          />
        </label>
      </div>
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={String(column.key)}>{column.label}</th>)}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render ? column.render(item) : String(item[column.key] ?? "")}
                  </td>
                ))}
                <td>
                  {!readOnly && <button onClick={() => setDraft({ ...item })}>编辑</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="ep-empty">暂无数据。</div>}
      </div>
      {!readOnly && draft && (
        <div className="ep-catalog-form">
          <div className="ep-catalog-form-head">
            <h3>{items.some((item) => item.id === draft.id) ? "编辑" : "新建"}{title}</h3>
            <button onClick={() => setDraft(null)}>关闭</button>
          </div>
          <div className="ep-form-grid">
            {fields.map((field) => {
              const value = draft[field.key];
              const inputValue = Array.isArray(value) ? value.join("，") : String(value ?? "");
              const options = field.options?.map((option) =>
                typeof option === "string" ? { value: option, label: option } : option,
              ) ?? [];
              return (
                <label className={"ep-form" + (field.wide ? " wide" : "")} key={String(field.key)}>
                  {field.label}
                  {field.type === "select" ? (
                    <select
                      value={String(value ?? "")}
                      onChange={(event) => update(field, event.target.value)}
                    >
                      {options.map((option) => (
                        <option value={String(option.value)} key={String(option.value)}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={inputValue}
                      onChange={(event) => update(field, event.target.value)}
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={inputValue}
                      onChange={(event) => update(field, event.target.value)}
                    />
                  )}
                </label>
              );
            })}
          </div>
          <div className="ep-actions">
            <button className="ep-button" onClick={save}>保存</button>
            <button className="ep-button secondary" onClick={() => setDraft(null)}>取消</button>
          </div>
        </div>
      )}
    </section>
  );
}
