"use client";

import React from "react";
import Button from "@/library/Button";
import Badge from "@/library/Badge";
import Input from "@/library/Input";
import Textarea from "@/library/Textarea";
import Select from "@/library/Select";

export default function DemoUIPage() {
  return (
    <div className="p-10 space-y-16 bg-white min-h-screen">
      {/* BUTTON COMPONENT */}
      <section>
        <h2 className="text-xl font-bold mb-8 text-neutral-800 border-b pb-2 uppercase tracking-wide">
          Button Component
        </h2>
        <div className="flex flex-wrap items-center gap-8">
          {/* Normal */}
          <div className="flex flex-col items-center gap-3">
            <Button variant="primary">Button</Button>
            <span className="text-sm text-neutral-500 font-medium">Normal</span>
          </div>

          {/* Hover */}
          <div className="flex flex-col items-center gap-3">
            <Button variant="primary" className="!bg-primary-700 !border-primary-700">Button</Button>
            <span className="text-sm text-neutral-500 font-medium">Hover</span>
          </div>

          {/* Active */}
          <div className="flex flex-col items-center gap-3">
            <Button variant="primary" className="!bg-primary-800">Button</Button>
            <span className="text-sm text-neutral-500 font-medium">Active</span>
          </div>

          {/* Disabled */}
          <div className="flex flex-col items-center gap-3">
            <Button variant="primary" disabled>Button</Button>
            <span className="text-sm text-neutral-500 font-medium">Disable</span>
          </div>
        </div>
      </section>

      {/* LABEL (BADGE) COMPONENT */}
      <section>
        <h2 className="text-xl font-bold mb-8 text-neutral-800 border-b pb-2 uppercase tracking-wide">
          Label Component
        </h2>
        <div className="flex flex-wrap items-center gap-8">
          {/* Primary */}
          <div className="flex flex-col items-center gap-3">
            <Badge variant="primary">Label</Badge>
            <span className="text-sm text-neutral-500 font-medium">Primary</span>
          </div>

          {/* Secondary */}
          <div className="flex flex-col items-center gap-3">
            <Badge variant="secondary">Label</Badge>
            <span className="text-sm text-neutral-500 font-medium">Secondary</span>
          </div>

          {/* Success */}
          <div className="flex flex-col items-center gap-3">
            <Badge variant="success">Label</Badge>
            <span className="text-sm text-neutral-500 font-medium">Success</span>
          </div>

          {/* Warning */}
          <div className="flex flex-col items-center gap-3">
            <Badge variant="warning">Label</Badge>
            <span className="text-sm text-neutral-500 font-medium">Warning</span>
          </div>

          {/* Error */}
          <div className="flex flex-col items-center gap-3">
            <Badge variant="error">Label</Badge>
            <span className="text-sm text-neutral-500 font-medium">Error</span>
          </div>

          {/* Neutral */}
          <div className="flex flex-col items-center gap-3">
            <Badge variant="neutral">Label</Badge>
            <span className="text-sm text-neutral-500 font-medium">Neutral</span>
          </div>
        </div>
      </section>

      {/* INPUT COMPONENT */}
      <section className="max-w-4xl">
        <h2 className="text-xl font-bold mb-8 text-neutral-800 border-b pb-2 uppercase tracking-wide">
          Input Component
        </h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          {/* Normal */}
          <div className="flex flex-col gap-2">
            <Input label="Label" placeholder="Content" />
            <span className="text-sm text-neutral-500 font-medium text-center mt-1">Normal</span>
          </div>

          {/* Hover */}
          <div className="flex flex-col gap-2">
            <Input label="Label" placeholder="Content" className="!border-primary-400" />
            <span className="text-sm text-neutral-500 font-medium text-center mt-1">Hover</span>
          </div>

          {/* Focus */}
          <div className="flex flex-col gap-2">
            <Input label="Label" placeholder="Content" className="!border-primary-500 ring-2 ring-primary-500/20" />
            <span className="text-sm text-neutral-500 font-medium text-center mt-1">Focus</span>
          </div>

          {/* Disabled */}
          <div className="flex flex-col gap-2">
            <Input label="Label" placeholder="Content" disabled />
            <span className="text-sm text-neutral-500 font-medium text-center mt-1">Disable</span>
          </div>

          {/* Select */}
          <div className="flex flex-col gap-2">
            <Select 
              label="Label" 
              options={[{ value: "1", label: "Content" }]}
              placeholder="Content"
              value="1"
            />
            <span className="text-sm text-neutral-500 font-medium text-center mt-1">Select</span>
          </div>

          {/* Error */}
          <div className="flex flex-col gap-2">
            <Input label="Label" placeholder="Content" error="Error message"/>
            <span className="text-sm text-neutral-500 font-medium text-center mt-1">Error</span>
          </div>

          {/* Textarea */}
          <div className="flex flex-col gap-2 col-span-2 max-w-md mx-auto w-full">
            <Textarea label="Label" placeholder="Content" rows={3} />
            <span className="text-sm text-neutral-500 font-medium text-center mt-1">Textarea</span>
          </div>
        </div>
      </section>
    </div>
  );
}
