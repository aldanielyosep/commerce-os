import { render, screen } from "@testing-library/react";
import { DataState } from "./DataState";

describe("DataState", () => {
  it("renders loading state", () => {
    render(
      <DataState loading={true} error={null} empty={false} emptyLabel="No rows">
        <div>content</div>
      </DataState>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <DataState loading={false} error="Failed request" empty={false} emptyLabel="No rows">
        <div>content</div>
      </DataState>
    );

    expect(screen.getByText("Failed request")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <DataState loading={false} error={null} empty={true} emptyLabel="No rows">
        <div>content</div>
      </DataState>
    );

    expect(screen.getByText("No rows")).toBeInTheDocument();
  });

  it("renders children when data exists", () => {
    render(
      <DataState loading={false} error={null} empty={false} emptyLabel="No rows">
        <div>content</div>
      </DataState>
    );

    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
