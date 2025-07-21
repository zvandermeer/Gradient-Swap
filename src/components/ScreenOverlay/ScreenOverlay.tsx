import "./ScreenOverlay.css";

interface Props extends React.PropsWithChildren {
  overlayVisible: boolean;
}

function ScreenOverlay({ overlayVisible, children }: Props) {
  return (
    <div className={"overlay " + (overlayVisible ? "" : "hide")}>
      <div className="box">{children}</div>
    </div>
  );
}

export default ScreenOverlay;
