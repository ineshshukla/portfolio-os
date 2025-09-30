import React, { useState, useRef, useEffect, useMemo } from 'react';
import './TerminalApp.css';
import ReactMarkdown from 'react-markdown';
import { useFileSystem } from '../../hooks/useFileSystem';
import { executeCommand } from '../../utils/terminalEngine';

const Prompt = ({ cwd }) => (
    <>
        <span className="prompt-user">user@portfolio-os</span>
        <span className="prompt-colon">:</span>
        {/* Replace home dir with ~ for display */}
        <span className="prompt-path">{cwd === '/' ? '~' : cwd}</span>
        <span className="prompt-end">$</span>
    </>
);

const INTRO_MARKDOWN = `
# Hi, I'm Inesh! - Welcome to my portfolio-os!

This is a toy os with several fun things to play with. Have fun!

Available commands:
=> **cd [path]** -- Changes the current working directory.
=> **ls [path]** -- Lists files and directories.
=> **mkdir <directory>** — Creates a new directory.
=> **man inesh** — Displays an about me section.
=> **cat <file>** — Displays the content of a file.
=> **clear** — Clears the terminal screen.
`;

const IntroBlock = () => ({ type: 'markdown', text: INTRO_MARKDOWN });

const TerminalApp = () => {
    const fs = useFileSystem();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([IntroBlock()]);
    const [cwd, setCwd] = useState('/'); // Current Working Directory
    const endOfHistoryRef = useRef(null);
    const inputRef = useRef(null);
    const commandHistory = useRef([]);

    // Scroll to the bottom of the history on new output
    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // Focus the input when the component mounts
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleInputKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = input.trim();
            const newHistory = [...history, { type: 'command', command, cwd }];

            if (command === 'clear') {
                setHistory([IntroBlock()]);
            } else if (command) {
                const result = await executeCommand(command, fs, cwd);
                if (result.output) {
                    newHistory.push({ type: 'output', text: result.output });
                }
                if (result.newCwd) {
                    setCwd(result.newCwd);
                }
                setHistory(newHistory);
            } else {
                // If the user just presses enter, add a new prompt line.
                setHistory(newHistory);
            }

            commandHistory.current.push(command);
            setInput('');
        }
    };

    return (
        <div className="terminal-app" onClick={() => inputRef.current?.focus()}>
            <div className="terminal-history">
                {history.map((item, index) => {
                    if (item.type === 'command') {
                        return (
                            <div key={index} className="history-item">
                                <Prompt cwd={item.cwd} />&nbsp;{item.command}
                            </div>
                        );
                    }
                    if (item.type === 'markdown') {
                        return (
                            <div key={index} className="history-item markdown-output">
                                <ReactMarkdown>{item.text}</ReactMarkdown>
                            </div>
                        );
                    }
                    // item.type === 'output'
                    return <div key={index} className="history-item output-text">{item.text}</div>;
                })}
                <div className="terminal-input-line">
                    <Prompt cwd={cwd} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="terminal-input"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        spellCheck="false"
                    />
                </div>
                <div ref={endOfHistoryRef} />
            </div>
        </div>
    );
};

export default TerminalApp;