/**
 * The commands the About terminal understands.
 *
 * An easter egg, not a shell: the point is that someone who tries typing gets
 * an answer instead of a dead prompt. Everything here is pure — parse a line,
 * return lines to print — so the component only owns focus, history and
 * scrolling, and this can be tested without a DOM.
 *
 * Deliberately untranslated, like the rest of the transcript: a prompt is a
 * prompt in either language, and localising `$ whoami` reads as a joke being
 * explained.
 */

export type TerminalAction = 'clear'

export interface CommandResultProps {
  output: string[]
  /** Something the component has to do that printing cannot express. */
  action?: TerminalAction
}

/** What the commands are allowed to know about the page around them. */
export interface TerminalContextProps {
  projectCount: number
  skillCount: number
  email: string
}

const FILES: Record<string, string[]> = {
  'philosophy.json': [
    '{',
    '  "mode": "building",',
    '  "method": "learn by doing",',
    '  "stack": "whatever the problem asks for"',
    '}'
  ],
  'readme.md': [
    '# Jonas Glatz',
    '',
    'Founder of NEXRON Studios. Applied AI student.',
    'Builds software, trains models, makes things move in 3D.'
  ],
  'todo.txt': [
    '[x] ship the portfolio',
    '[ ] finish the cube',
    '[ ] write the imprint',
    '[ ] sleep'
  ]
}

const HELP: string[] = [
  'available commands',
  '',
  '  help          this list',
  '  whoami        short version',
  '  ls            list files',
  '  cat <file>    read one',
  '  skills        what I work with',
  '  projects      what I have built',
  '  contact       how to reach me',
  '  theme         switch light / dark',
  '  echo <text>   say it back',
  '  clear         wipe the screen',
  '',
  'tip: arrow up walks back through history.'
]

/**
 * Splits a line into command and arguments. Collapses repeated spaces so
 * `cat   readme.md` behaves the way anyone would expect it to.
 */
export const parseInput = (input: string): { name: string; args: string[] } => {
  const parts = input.trim().split(/\s+/).filter(Boolean)
  const [name = '', ...args] = parts

  return { name: name.toLowerCase(), args }
}

export const listFiles = (): string[] => Object.keys(FILES).sort()

export const runCommand = (
  input: string,
  context: TerminalContextProps
): CommandResultProps => {
  const { name, args } = parseInput(input)

  // An empty line is not an error — a shell just gives you a new prompt.
  if (name === '') return { output: [] }

  switch (name) {
    case 'help':
    case '?':
      return { output: HELP }

    case 'whoami':
      return { output: ['Jonas Glatz — founder, NEXRON Studios.'] }

    case 'ls':
      return { output: [listFiles().join('   ')] }

    case 'cat': {
      const target = args[0]
      if (!target) return { output: ['cat: missing file. try `ls`.'] }

      const contents = FILES[target.toLowerCase()]
      if (!contents) return { output: [`cat: ${target}: no such file. try \`ls\`.`] }

      return { output: [...contents] }
    }

    case 'skills':
      return {
        output: [
          `${context.skillCount} technologies across four areas.`,
          'development · ai & data · 3d & creative · infrastructure',
          'scroll down to the tech stack to push them around.'
        ]
      }

    case 'projects':
      return {
        output: [
          `${context.projectCount} projects listed.`,
          'scroll to "Projekte" — or check github.com/nexron-studios.'
        ]
      }

    case 'contact':
      return { output: [context.email, 'or use the form at the bottom of this page.'] }

    case 'theme':
      return { output: ['use the sun / moon switch in the header.'] }

    case 'echo':
      return { output: [args.join(' ')] }

    case 'clear':
      return { output: [], action: 'clear' }

    case 'sudo':
      return { output: ['nice try.'] }

    case 'exit':
    case 'quit':
      return { output: ['there is no exit. just scroll.'] }

    default:
      return { output: [`${name}: command not found. try \`help\`.`] }
  }
}
