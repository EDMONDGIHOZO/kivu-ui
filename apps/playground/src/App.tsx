import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Highlight,
  IconButton,
  Input,
  IconTile,
  Modal,
  SectionHeader,
  Select,
  Spinner,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTrigger,
  Textarea,
} from "@kivu-ui/react";

/* --- tiny inline icon set (stroke icons, 1em) --- */
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const Plus = () => <Icon d="M12 5v14M5 12h14" />;
const Search = () => <Icon d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4" />;
const Moon = () => <Icon d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />;
const Board = () => <Icon d="M4 4h16v16H4zM9.5 4v16M15 4v16" />;
const Clock = () => <Icon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2" />;
const Receipt = () => <Icon d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6" />;

type Status = "doing" | "review" | "done";
const projects: { name: string; client: string; status: Status; due: string; team: string[] }[] = [
  { name: "Brand refresh", client: "Nyota Coffee", status: "doing", due: "Fri", team: ["Aline Uwase", "Mei Tanaka"] },
  { name: "Website launch", client: "Kivu Outdoors", status: "review", due: "Mon", team: ["Lucas Ferreira", "Amara Okafor", "Kofi Mensah"] },
  { name: "Packaging", client: "Ubuki Honey", status: "done", due: "Done", team: ["Sofia Rossi"] },
];
const statusBadge: Record<Status, { label: string; tone: "accent" | "primary" | "success" }> = {
  doing: { label: "In progress", tone: "primary" },
  review: { label: "In review", tone: "accent" },
  done: { label: "Done", tone: "success" },
};

const stats = [
  { icon: <Board />, label: "Open projects", value: "6" },
  { icon: <Clock />, label: "Hours this week", value: "31.5" },
  { icon: <Receipt />, label: "Unpaid invoices", value: "$4,280" },
];

export default function App() {
  const [dark, setDark] = useState(false);
  const [modal, setModal] = useState(false);
  const [hours, setHours] = useState("12");
  const [rate, setRate] = useState("85");
  const total = (Number(hours) || 0) * (Number(rate) || 0);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-canvas text-fg">
        <Banner dismissible action={<Button size="sm">See what&apos;s new</Button>}>
          Timelines are here: plan every project on one board.
        </Banner>

        {/* ---------- Header (layout is plain Tailwind; pieces are Kivu UI) ---------- */}
        <header className="border-b border-line bg-surface">
          <Container className="flex h-16 items-center gap-8">
            <span className="flex items-center gap-2">
              <span className="font-display text-2xl">Field</span>
            </span>
            <nav className="hidden gap-6 text-sm text-fg-muted md:flex">
              {["Overview", "Projects", "Invoices", "Team"].map((item, i) => (
                <a key={item} href="#" className={i === 1 ? "font-medium text-fg" : "hover:text-fg"}>
                  {item}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <IconButton aria-label="Search" variant="ghost"><Search /></IconButton>
              <IconButton aria-label="Toggle dark mode" variant="ghost" onClick={() => setDark((d) => !d)}><Moon /></IconButton>
              <Avatar name="Aline Uwase" size="sm" />
            </div>
          </Container>
        </header>

        <main>
          {/* ---------- Page header + stats ---------- */}
          <section className="relative border-b border-line bg-canvas-subtle">
            <Container className="flex flex-wrap items-end justify-between gap-6 py-12">
              <SectionHeader
                align="start"
                as="h1"
                eyebrow="Field Studio · Projects"
                title={<>Good morning, <Highlight>Aline</Highlight></>}
                description="Three projects need you this week."
              />
              <Button leftSection={<Plus />} onClick={() => setModal(true)}>New project</Button>
            </Container>
          </section>

          <Container className="space-y-12 py-12">
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((s) => (
                <Card key={s.label} variant="outline" className="flex items-center gap-4">
                  <IconTile size="sm">{s.icon}</IconTile>
                  <div>
                    <p className="text-sm text-fg-subtle">{s.label}</p>
                    <p className="font-display text-3xl">{s.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* ---------- Projects with tabs ---------- */}
            <Tabs defaultValue="all">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="mine">Assigned to me</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
                <Input aria-label="Filter projects" placeholder="Filter…" size="sm" leftSection={<Search />} wrapperClassName="w-56" />
              </div>
              <TabsPanel value="all">
                <div className="grid gap-4 md:grid-cols-3">
                  {projects.map((p) => (
                    <Card key={p.name} interactive asChild variant="outline">
                      <a href="#" className="block space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-sm text-fg-subtle">{p.client}</p>
                          </div>
                          <Badge tone={statusBadge[p.status].tone}>{statusBadge[p.status].label}</Badge>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between">
                          <AvatarGroup size="sm" max={3}>
                            {p.team.map((n) => <Avatar key={n} name={n} />)}
                          </AvatarGroup>
                          <span className="text-xs text-fg-subtle">due {p.due}</span>
                        </div>
                      </a>
                    </Card>
                  ))}
                </div>
              </TabsPanel>
              <TabsPanel value="mine"><p className="text-fg-muted">Two projects are assigned to you.</p></TabsPanel>
              <TabsPanel value="archived">
                <div className="flex items-center gap-3 text-fg-muted"><Spinner className="text-primary" /> Loading archive…</div>
              </TabsPanel>
            </Tabs>

            {/* ---------- Invoice quick-calc + settings ---------- */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card variant="elevated" padding="lg" className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl">Quick invoice</h2>
                  <Tabs defaultValue="hourly" variant="pills">
                    <TabsList>
                      <TabsTrigger value="hourly">Hourly</TabsTrigger>
                      <TabsTrigger value="fixed">Fixed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Hours" inputMode="decimal" value={hours} onChange={(e) => setHours(e.target.value)} rightSection="h" />
                  <Input label="Rate" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} rightSection="USD/h" />
                </div>
                <Select label="Client" options={projects.map((p) => p.client)} />
                <div className="flex items-center justify-between rounded-kivu-md bg-canvas-subtle px-4 py-3">
                  <span className="text-sm text-fg-muted">Total</span>
                  <span className="font-display text-2xl">${total.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button>Send invoice</Button>
                  <Button variant="outline">Save draft</Button>
                </div>
              </Card>

              <Card variant="outline" padding="lg" className="space-y-5">
                <h2 className="font-display text-xl">Notifications</h2>
                <Switch label="Weekly summary" description="Every Monday at 09:00." defaultChecked />
                <Switch label="Client comments" description="Email me when a client replies." />
                <Divider />
                <Checkbox label="Mentions" defaultChecked />
                <Checkbox label="Status changes" description="When a task moves between columns." />
                <Checkbox label="Everything" indeterminate />
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="soft" size="sm">Soft</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button tone="accent" size="sm">Accent</Button>
                  <Button tone="danger" variant="soft" size="sm">Danger</Button>
                  <Button loading size="sm">Saving</Button>
                </div>
              </Card>
            </div>

            {/* ---------- Help ---------- */}
            <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
              <SectionHeader align="start" eyebrow="Help" title="Questions, answered" />
              <Accordion defaultValue={["seats"]}>
                <AccordionItem value="seats">
                  <AccordionTrigger>How are seats counted?</AccordionTrigger>
                  <AccordionContent>Every member with edit access uses a seat. Viewers and clients are free.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="export">
                  <AccordionTrigger>Can I export my projects?</AccordionTrigger>
                  <AccordionContent>Yes. Download any project as CSV or JSON from its settings page.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="cancel">
                  <AccordionTrigger>What happens if I cancel?</AccordionTrigger>
                  <AccordionContent>Your workspace stays read-only for 30 days, then it is deleted.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <Card variant="brand" padding="lg" radius="xl" className="text-center">
              <SectionHeader
                inverted
                title="Invite your whole studio"
                description="Clients get a read-only portal for free."
                actions={<Button className="bg-ink-50 text-ink-900 hover:bg-white">Invite people</Button>}
              />
            </Card>
          </Container>
        </main>

        <Modal
          open={modal}
          onClose={() => setModal(false)}
          title="New project"
          description="You can change all of this later."
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={() => setModal(false)}>Create project</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="Project name" placeholder="Brand refresh" />
            <Select label="Client" placeholder="Choose a client" defaultValue="" options={projects.map((p) => p.client)} />
            <Textarea label="Brief" rows={3} />
          </div>
        </Modal>
      </div>
    </div>
  );
}
