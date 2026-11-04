import { useEffect, useState } from "react";
import {
  ArrowUpRight, Github, Linkedin, Mail, Menu, X, Code2, GraduationCap,
  Layers3, ShieldCheck, Plus, Pencil, Trash2, LogOut, Image as ImageIcon
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./supabase";

const initial = {
  about: "I am a Computer Science student currently studying in the 3rd semester at Dawood University of Engineering and Technology, Karachi.",
  skills: ["Microsoft Excel", "Java", "C++"],
  projects: [],
  photo: ""
};

export default function App() {
  const [data, setData] = useState(initial);
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectLink, setProjectLink] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (session?.user?.id) checkAdmin();
    else setIsAdmin(false);
  }, [session]);

  async function loadContent() {
    if (!isSupabaseConfigured) return;
    const { data: row, error } = await supabase.from("portfolio_content").select("content").eq("id", 1).maybeSingle();
    if (!error && row?.content) setData({ ...initial, ...row.content });
  }

  async function checkAdmin() {
    const { data: row, error } = await supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle();
    setIsAdmin(!error && Boolean(row));
  }

  async function saveContent(next) {
    setLoading(true); setNotice("");
    const { error } = await supabase.from("portfolio_content").upsert({ id: 1, content: next });
    setLoading(false);
    if (error) setNotice("Save failed: " + error.message);
    else { setData(next); setNotice("Changes saved successfully."); }
  }

  async function signIn() {
    if (!isSupabaseConfigured) { setNotice("First complete the Supabase setup in the README."); return; }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) setNotice(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null); setIsAdmin(false);
  }

  async function uploadPhoto(file) {
    if (!file || !isAdmin) return;
    const ext = file.name.split(".").pop();
    const path = `profile-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file, { upsert: true });
    if (error) { setNotice(error.message); return; }
    const { data: urlData } = supabase.storage.from("portfolio-media").getPublicUrl(path);
    const next = { ...data, photo: urlData.publicUrl };
    await saveContent(next);
  }

  function addSkill() {
    const value = skillInput.trim();
    if (!value || data.skills.includes(value)) return;
    saveContent({ ...data, skills: [...data.skills, value] });
    setSkillInput("");
  }

  function addProject() {
    if (!projectTitle.trim()) return;
    const next = { ...data, projects: [...data.projects, {
      id: crypto.randomUUID(), title: projectTitle.trim(),
      description: projectDescription.trim(), link: projectLink.trim()
    }] };
    saveContent(next);
    setProjectTitle(""); setProjectDescription(""); setProjectLink("");
  }

  function removeProject(id) {
    saveContent({ ...data, projects: data.projects.filter(p => p.id !== id) });
  }

  const nav = ["Home", "About", "Skills", "Projects", "Contact"];
  const goTo = (item) => {
    document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <header className="header">
        <a className="brand" href="#home" onClick={() => setMenuOpen(false)}><span>N</span> NOSHAD ALI</a>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          {nav.map(item => <button key={item} onClick={() => goTo(item)}>{item}</button>)}
          <button className="admin-nav" onClick={() => setAdminOpen(true)}>Admin <ArrowUpRight size={15}/></button>
        </nav>
        <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X/> : <Menu/>}
        </button>
      </header>

      <main>
        <section id="home" className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot"/> PERSONAL PORTFOLIO</div>
            <h1>Noshad <span>Ali.</span></h1>
            <h2>Computer Science Student</h2>
            <p className="hero-description">Curious about technology. Focused on learning, creating, and growing one step at a time.</p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => goTo("Projects")}>Explore my work <ArrowUpRight size={17}/></button>
              <button className="text-btn" onClick={() => goTo("Contact")}>Get in touch</button>
            </div>
            <div className="hero-meta"><span><GraduationCap size={17}/> Dawood University of Engineering and Technology</span><span className="meta-separator">/</span><span>Karachi, Pakistan</span></div>
          </div>
          <div className="hero-visual">
            <div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/>
            <div className="profile-frame">
              {data.photo ? <img src={data.photo} alt="Noshad Ali profile"/> : <div className="avatar-placeholder"><span>NA</span><small>PROFILE PHOTO</small></div>}
            </div>
            <div className="floating-card"><Code2 size={18}/><span>Always learning</span></div>
            <div className="visual-index">01 <i/> PORTFOLIO</div>
          </div>
          <div className="scroll-cue">SCROLL TO EXPLORE <span/></div>
        </section>

        <section id="about" className="content-section section-wrap">
          <div className="section-kicker">01 / ABOUT</div>
          <div className="section-heading"><h2>A little about <span>me.</span></h2><p>My academic journey and the ideas I'm exploring.</p></div>
          <div className="about-card">
            <div className="about-icon"><GraduationCap size={28}/></div>
            <div><h3>Computer Science Student</h3><p>{data.about}</p></div>
            <div className="about-mark">NA<span>.</span></div>
          </div>
        </section>

        <section id="skills" className="content-section section-wrap">
          <div className="section-kicker">02 / SKILLS</div>
          <div className="section-heading"><h2>Tools I’m <span>learning.</span></h2><p>A growing collection of technologies and tools.</p></div>
          <div className="skills-grid">
            {data.skills.map((skill, i) => <article className="skill-card" key={skill}><div className="skill-number">0{i + 1}</div><div className="skill-icon"><Layers3 size={22}/></div><h3>{skill}</h3><span className="skill-line"/></article>)}
          </div>
        </section>

        <section id="projects" className="content-section section-wrap">
          <div className="section-kicker">03 / PROJECTS</div>
          <div className="section-heading"><h2>Selected <span>projects.</span></h2><p>Things I’ve worked on and continue to build.</p></div>
          {data.projects.length ? <div className="projects-grid">{data.projects.map((p, i) => <article className="project-card" key={p.id}><div className="project-top"><span>PROJECT / 0{i + 1}</span><Code2/></div><h3>{p.title}</h3><p>{p.description}</p>{p.link && <a href={p.link} target="_blank" rel="noreferrer">View project <ArrowUpRight size={16}/></a>}</article>)}</div> :
            <div className="empty-projects"><div className="empty-icon"><Code2 size={26}/></div><h3>Projects are on the way.</h3><p>New work will appear here as it is added.</p></div>}
        </section>

        <section id="contact" className="contact-section section-wrap">
          <div className="section-kicker">04 / CONTACT</div>
          <div className="contact-panel"><div><div className="eyebrow">LET’S CONNECT</div><h2>Have a project<br/>or idea in mind<span>?</span></h2><p>Feel free to reach out. I’m always open to learning and connecting.</p></div><a className="contact-link" href="mailto:hello@example.com"><Mail size={19}/> Email me <ArrowUpRight size={18}/></a></div>
        </section>
      </main>

      <footer className="footer section-wrap"><a className="brand" href="#home"><span>N</span> NOSHAD ALI</a><p>Designed with purpose. Built for growth.</p><span>© {new Date().getFullYear()} Noshad Ali</span></footer>

      {adminOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAdminOpen(false); }}>
        <div className="admin-modal">
          <div className="modal-head"><div><div className="eyebrow">PRIVATE AREA</div><h2>Admin <span>dashboard.</span></h2></div><button className="icon-btn" onClick={() => setAdminOpen(false)}><X/></button></div>
          {!session ? <div className="login-box"><div className="login-icon"><ShieldCheck size={28}/></div><h3>Welcome back</h3><p>Sign in with the Google account authorized by the site owner.</p><button className="google-btn" onClick={signIn}>Continue with Google</button></div> :
            !isAdmin ? <div className="login-box"><div className="login-icon"><ShieldCheck size={28}/></div><h3>Access not authorized</h3><p>This Google account is signed in, but it is not on the administrator allowlist.</p><button className="google-btn secondary" onClick={signOut}>Sign out</button></div> :
            <div className="admin-content">
              <div className="admin-user"><span>{session.user.email}</span><button onClick={signOut}><LogOut size={15}/> Sign out</button></div>
              <label className="field-label">About Me</label><textarea value={data.about} onChange={e => setData({ ...data, about: e.target.value })}/><button className="save-btn" disabled={loading} onClick={() => saveContent(data)}>Save About</button>
              <div className="admin-divider"/>
              <label className="field-label">Profile photo</label><label className="upload-btn"><ImageIcon size={16}/> Upload photo<input type="file" accept="image/*" onChange={e => uploadPhoto(e.target.files?.[0])}/></label>
              <div className="admin-divider"/>
              <label className="field-label">Skills</label><div className="inline-form"><input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill"/><button onClick={addSkill}><Plus size={17}/></button></div>
              <div className="admin-list">{data.skills.map(skill => <div key={skill}><span>{skill}</span><button aria-label={`Delete ${skill}`} onClick={() => saveContent({ ...data, skills: data.skills.filter(s => s !== skill) })}><Trash2 size={16}/></button></div>)}</div>
              <div className="admin-divider"/>
              <label className="field-label">Add a project</label><input className="full-input" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Project title"/><textarea value={projectDescription} onChange={e => setProjectDescription(e.target.value)} placeholder="Short description"/><input className="full-input" value={projectLink} onChange={e => setProjectLink(e.target.value)} placeholder="Project URL (optional)"/><button className="save-btn" onClick={addProject}><Plus size={16}/> Add project</button>
              {data.projects.map(p => <div className="admin-project" key={p.id}><span>{p.title}</span><button onClick={() => removeProject(p.id)}><Trash2 size={16}/></button></div>)}
            </div>}
          {notice && <div className="notice">{notice}</div>}
          <div className="modal-foot">Changes are saved to your connected database.</div>
        </div>
      </div>}
    </div>
  );
}