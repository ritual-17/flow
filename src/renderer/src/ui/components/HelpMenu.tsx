import defaultKeymaps from '@renderer/config/defaultKeymaps.json';
import { KeyMap } from '@renderer/core/commands/KeyMaps';
import { useStore } from '@renderer/ui/Store';

// Visual that shows all commands and what they do
export function HelpMenu() {
  const mode = useStore((state) => state.editor.mode);
  const open = useStore((state) => state.editor.helpMenuOpen);
  const mode_commands = defaultKeymaps[mode] as KeyMap;
  const all_commands = defaultKeymaps['all'] as KeyMap;

  const curr_commands = {
    ...(mode_commands || {}),
    ...(all_commands || {}),
  };
  console.log(open);
  return (
    <div>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: open ? 0 : '-320px',
          width: '320px',
          height: '100vh',
          background: '#000000',
          padding: '20px',
          transition: 'right 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2>Help Menu. Mode: {mode.toUpperCase()}</h2>
        <ul
          style={{
            padding: 0,
            flex: 1,
            overflowY: 'auto',
            listStyle: 'none',
          }}
        >
          {Object.entries(curr_commands).map(([keys, action]) => (
            <li
              key={keys}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '2.5px 0',
                borderBottom: '1px solid #555',
                fontSize: '12.5px',
              }}
            >
              <span>{keys}</span>
              <span style={{ opacity: 0.8 }}>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
