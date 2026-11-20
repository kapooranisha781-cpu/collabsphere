import "./Loader.css";

const Loader = ({ fullscreen = false, text = "", size = 28 }) => (
  <div className={fullscreen ? "loader-wrap loader-fullscreen" : "loader-wrap"}>
    <span className="loader-spinner" style={{ width: size, height: size }} />
    {text && <p className="loader-text">{text}</p>}
  </div>
);

export default Loader;