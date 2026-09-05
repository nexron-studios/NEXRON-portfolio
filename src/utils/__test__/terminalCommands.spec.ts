import { describe, expect, it } from 'vitest'
import {
  commandNameList,
  completeCommand,
  listFiles,
  parseInput,
  runCommand,
  suggestedCommandList,
  type TerminalContextProps
} from '../terminalCommands'

const context: TerminalContextProps = {
  projectCount: 6,
  skillCount: 24,
  email: 'nexronstudios@gmail.com'
}

describe('parseInput', () => {
  it('should split a command from its arguments', () => {
    expect(parseInput('cat readme.md')).toEqual({ name: 'cat', args: ['readme.md'] })
  })

  it('should lowercase the command name', () => {
    expect(parseInput('HELP').name).toBe('help')
  })

  it('should collapse repeated spaces', () => {
    expect(parseInput('cat    readme.md')).toEqual({ name: 'cat', args: ['readme.md'] })
  })

  it('should ignore surrounding whitespace', () => {
    expect(parseInput('   whoami   ').name).toBe('whoami')
  })

  it('should return an empty name for a blank line', () => {
    expect(parseInput('   ')).toEqual({ name: '', args: [] })
  })

  it('should keep every argument after the command', () => {
    expect(parseInput('echo one two three').args).toEqual(['one', 'two', 'three'])
  })
})

describe('listFiles', () => {
  it('should return the files sorted', () => {
    const files = listFiles()

    expect(files).toEqual([...files].sort())
  })

  it('should include the philosophy file the intro reads', () => {
    expect(listFiles()).toContain('philosophy.json')
  })
})

describe('runCommand', () => {
  it('should print nothing for a blank line', () => {
    expect(runCommand('', context)).toEqual({ output: [] })
  })

  it('should print nothing for a whitespace-only line', () => {
    expect(runCommand('   ', context).output).toEqual([])
  })

  it('should list the available commands for help', () => {
    const { output } = runCommand('help', context)

    expect(output.join('\n')).toContain('whoami')
    expect(output.join('\n')).toContain('clear')
  })

  it('should answer whoami with a name', () => {
    expect(runCommand('whoami', context).output.join(' ')).toContain('Jonas Glatz')
  })

  it('should list files for ls', () => {
    expect(runCommand('ls', context).output.join(' ')).toContain('readme.md')
  })

  it('should print a known file for cat', () => {
    expect(runCommand('cat philosophy.json', context).output.join('\n')).toContain('"mode"')
  })

  it('should find a file regardless of the case typed', () => {
    expect(runCommand('cat README.MD', context).output.length).toBeGreaterThan(1)
  })

  it('should explain itself when cat gets no argument', () => {
    expect(runCommand('cat', context).output.join(' ')).toContain('missing file')
  })

  it('should report an unknown file rather than printing nothing', () => {
    expect(runCommand('cat nope.txt', context).output.join(' ')).toContain('no such file')
  })

  it('should report the project count', () => {
    expect(runCommand('projects', context).output.join(' ')).toContain('6')
  })

  it('should report the skill count', () => {
    expect(runCommand('skills', context).output.join(' ')).toContain('24')
  })

  it('should give the address for contact', () => {
    expect(runCommand('contact', context).output.join(' ')).toContain(context.email)
  })

  it('should echo its arguments back', () => {
    expect(runCommand('echo hello there', context).output).toEqual(['hello there'])
  })

  it('should echo an empty line when given nothing', () => {
    expect(runCommand('echo', context).output).toEqual([''])
  })

  it('should ask for a clear rather than printing', () => {
    expect(runCommand('clear', context)).toEqual({ output: [], action: 'clear' })
  })

  it('should refuse sudo with a joke rather than an error', () => {
    expect(runCommand('sudo rm -rf /', context).output).toEqual(['nice try.'])
  })

  it('should point an unknown command at help', () => {
    const { output } = runCommand('sl', context)

    expect(output.join(' ')).toContain('command not found')
    expect(output.join(' ')).toContain('help')
  })

  it('should not set an action for an ordinary command', () => {
    expect(runCommand('whoami', context).action).toBeUndefined()
  })

  it('should ask for the game rather than printing it', () => {
    expect(runCommand('tetris', context).action).toBe('tetris')
  })

  it('should acknowledge the game before it opens', () => {
    expect(runCommand('tetris', context).output).not.toHaveLength(0)
  })

  it('should list the game in help', () => {
    expect(runCommand('help', context).output.join('\n')).toContain('tetris')
  })
})

describe('completeCommand', () => {
  it('should complete an unambiguous prefix', () => {
    expect(completeCommand('tet')).toBe('tetris')
  })

  it('should complete only as far as several matches agree', () => {
    // `cat` and `clear` share nothing past the first letter.
    expect(completeCommand('c')).toBe('c')
  })

  it('should complete past a shared prefix once it is unambiguous', () => {
    expect(completeCommand('cl')).toBe('clear')
  })

  it('should leave an unknown prefix alone', () => {
    expect(completeCommand('zzz')).toBe('zzz')
  })

  it('should leave a blank input alone', () => {
    expect(completeCommand('')).toBe('')
  })

  it('should not touch anything past the first word', () => {
    expect(completeCommand('cat read')).toBe('cat read')
  })

  it('should ignore case', () => {
    expect(completeCommand('TET')).toBe('tetris')
  })
})

describe('suggestedCommandList', () => {
  it('should only suggest commands that exist', () => {
    for (const suggestion of suggestedCommandList) {
      expect(commandNameList).toContain(suggestion)
    }
  })

  it('should not suggest a command that answers with "not found"', () => {
    for (const suggestion of suggestedCommandList) {
      expect(runCommand(suggestion, context).output.join(' ')).not.toContain('command not found')
    }
  })
})
