import type * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Avatar, AvatarGroup, Button, Checkbox, Input, Modal, Select, Tabs, TabsList, TabsPanel, TabsTrigger, cx,
} from "../index";

describe("cx", () => {
  it("joins truthy values and nested arrays", () => {
    expect(cx("a", false, null, ["b", undefined, ["c"]], 0, "d")).toBe("a b c d");
  });
});

describe("Button", () => {
  it("defaults to type=button and appends user (Tailwind) classes", () => {
    render(<Button className="px-10 bg-red-500">Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn.className).toContain("kivu-btn kivu-btn--solid kivu-btn--md");
    expect(btn.className).toContain("px-10 bg-red-500");
  });

  it("is disabled and busy while loading", () => {
    render(<Button loading>Publish</Button>);
    const btn = screen.getByRole("button", { name: /publish/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the child element with asChild", async () => {
    const onClick = vi.fn();
    const childClick = vi.fn();
    render(
      <Button asChild variant="soft" onClick={onClick}>
        <a href="/projects/new" className="underline" onClick={childClick}>New project</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "New project" });
    expect(link.className).toContain("kivu-btn--soft");
    expect(link.className).toContain("underline");
    link.addEventListener("click", (e) => e.preventDefault());
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    expect(childClick).toHaveBeenCalledOnce();
  });
});

describe("Slot / asChild", () => {
  it("unwraps a lazy child (React Server Components streaming)", () => {
    const anchor = <a href="/changelog">Changelog</a>;
    // Shape of the lazy element React creates for server-passed children.
    const payload = Object.assign(Promise.resolve(anchor), { status: "fulfilled", value: anchor });
    const lazy = { $$typeof: Symbol.for("react.lazy"), _payload: payload, _init: (p: { value: unknown }) => p.value };
    render(<Button asChild>{lazy as unknown as React.ReactElement}</Button>);
    const link = screen.getByRole("link", { name: "Changelog" });
    expect(link.className).toContain("kivu-btn");
  });

  it("forwards refs to the child", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Button asChild ref={ref as React.Ref<HTMLButtonElement>}><a href="/x">X</a></Button>);
    expect(ref.current?.tagName).toBe("A");
  });
});

describe("Input", () => {
  it("associates label, description and error", () => {
    render(<Input label="Project name" description="Shown to clients" error="Required" />);
    const input = screen.getByLabelText("Project name");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Shown to clients Required");
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("renders select options", () => {
    render(<Select label="Role" options={["Viewer", { value: "editor", label: "Editor" }]} defaultValue="editor" />);
    expect(screen.getByLabelText("Role")).toHaveValue("editor");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("checkbox toggles", async () => {
    render(<Checkbox label="I agree" />);
    const box = screen.getByLabelText("I agree");
    await userEvent.click(box);
    expect(box).toBeChecked();
  });
});

describe("Tabs", () => {
  const ui = (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">Overview</TabsTrigger>
        <TabsTrigger value="b">Activity</TabsTrigger>
        <TabsTrigger value="c">Settings</TabsTrigger>
      </TabsList>
      <TabsPanel value="a">Panel A</TabsPanel>
      <TabsPanel value="b">Panel B</TabsPanel>
      <TabsPanel value="c">Panel C</TabsPanel>
    </Tabs>
  );

  it("switches panels on click", async () => {
    render(ui);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel A");
    await userEvent.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel B");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });

  it("supports arrow keys with wrap-around", async () => {
    render(ui);
    screen.getByRole("tab", { name: "Overview" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Settings" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel C");
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel A");
  });
});

describe("Accordion", () => {
  it("opens one item at a time by default", async () => {
    render(
      <Accordion>
        <AccordionItem value="1">
          <AccordionTrigger>Pricing?</AccordionTrigger>
          <AccordionContent>Free</AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>Support?</AccordionTrigger>
          <AccordionContent>Email</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const [t1, t2] = screen.getAllByRole("button");
    await userEvent.click(t1);
    expect(t1).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(t2);
    expect(t1).toHaveAttribute("aria-expanded", "false");
    expect(t2).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Avatar", () => {
  it("falls back to initials and caps the group", () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="Aline Uwase" />
        <Avatar name="Jean" />
        <Avatar name="Eric M" />
      </AvatarGroup>,
    );
    expect(screen.getByText("AU")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });
});

describe("Modal", () => {
  it("calls onClose from the close button", async () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Confirm">Body</Modal>);
    await userEvent.click(screen.getByRole("button", { name: "Close", hidden: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
