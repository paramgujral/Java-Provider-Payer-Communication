"use client";

import { PageHeader } from "@/components/StatCard";
import { RequestForm } from "@/components/RequestForm";

export default function NewRequest() {
  return (
    <div>
      <PageHeader
        title="New authorization request"
        subtitle="The copilot reviews your request live as you fill it in."
      />
      <RequestForm mode="new" />
    </div>
  );
}
