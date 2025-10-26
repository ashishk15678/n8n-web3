import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
} from '../base-node'

describe('BaseNode', () => {
  it('should render without crashing', () => {
    const { container } = render(<BaseNode />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render children', () => {
    render(<BaseNode>Test Content</BaseNode>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    const { container } = render(<BaseNode className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should have default styling classes', () => {
    const { container } = render(<BaseNode />)
    const node = container.firstChild as HTMLElement
    expect(node.className).toContain('rounded-md')
    expect(node.className).toContain('border')
    expect(node.className).toContain('bg-card')
  })

  it('should have tabIndex of 0 for keyboard accessibility', () => {
    const { container } = render(<BaseNode />)
    expect(container.firstChild).toHaveAttribute('tabIndex', '0')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<BaseNode ref={ref as any} />)
    expect(ref).toHaveBeenCalled()
  })

  it('should accept and pass through HTML attributes', () => {
    const handleClick = vi.fn()
    const { container } = render(
      <BaseNode onClick={handleClick} data-testid="base-node" />
    )
    const node = container.firstChild as HTMLElement
    node.click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})

describe('BaseNodeHeader', () => {
  it('should render without crashing', () => {
    const { container } = render(<BaseNodeHeader />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render children', () => {
    render(<BaseNodeHeader>Header Content</BaseNodeHeader>)
    expect(screen.getByText('Header Content')).toBeInTheDocument()
  })

  it('should be a header element', () => {
    const { container } = render(<BaseNodeHeader />)
    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    const { container } = render(<BaseNodeHeader className="custom-header" />)
    expect(container.firstChild).toHaveClass('custom-header')
  })

  it('should have default flex layout classes', () => {
    const { container } = render(<BaseNodeHeader />)
    const header = container.firstChild as HTMLElement
    expect(header.className).toContain('flex')
    expect(header.className).toContain('items-center')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<BaseNodeHeader ref={ref as any} />)
    expect(ref).toHaveBeenCalled()
  })
})

describe('BaseNodeHeaderTitle', () => {
  it('should render without crashing', () => {
    const { container } = render(<BaseNodeHeaderTitle />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render title text', () => {
    render(<BaseNodeHeaderTitle>Node Title</BaseNodeHeaderTitle>)
    expect(screen.getByText('Node Title')).toBeInTheDocument()
  })

  it('should be an h3 element', () => {
    const { container } = render(<BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>)
    expect(container.querySelector('h3')).toBeInTheDocument()
  })

  it('should have user-select-none class for native app feel', () => {
    const { container } = render(<BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>)
    const title = container.firstChild as HTMLElement
    expect(title.className).toContain('user-select-none')
  })

  it('should have font-semibold class', () => {
    const { container } = render(<BaseNodeHeaderTitle>Title</BaseNodeHeaderTitle>)
    const title = container.firstChild as HTMLElement
    expect(title.className).toContain('font-semibold')
  })

  it('should accept custom className', () => {
    const { container } = render(<BaseNodeHeaderTitle className="custom-title" />)
    expect(container.firstChild).toHaveClass('custom-title')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<BaseNodeHeaderTitle ref={ref as any} />)
    expect(ref).toHaveBeenCalled()
  })
})

describe('BaseNodeContent', () => {
  it('should render without crashing', () => {
    const { container } = render(<BaseNodeContent />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render children', () => {
    render(<BaseNodeContent>Content Area</BaseNodeContent>)
    expect(screen.getByText('Content Area')).toBeInTheDocument()
  })

  it('should be a div element', () => {
    const { container } = render(<BaseNodeContent />)
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement)
  })

  it('should have flex column layout', () => {
    const { container } = render(<BaseNodeContent />)
    const content = container.firstChild as HTMLElement
    expect(content.className).toContain('flex')
    expect(content.className).toContain('flex-col')
  })

  it('should have padding classes', () => {
    const { container } = render(<BaseNodeContent />)
    const content = container.firstChild as HTMLElement
    expect(content.className).toContain('p-3')
  })

  it('should accept custom className', () => {
    const { container } = render(<BaseNodeContent className="custom-content" />)
    expect(container.firstChild).toHaveClass('custom-content')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<BaseNodeContent ref={ref as any} />)
    expect(ref).toHaveBeenCalled()
  })
})

describe('BaseNodeFooter', () => {
  it('should render without crashing', () => {
    const { container } = render(<BaseNodeFooter />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render children', () => {
    render(<BaseNodeFooter>Footer Content</BaseNodeFooter>)
    expect(screen.getByText('Footer Content')).toBeInTheDocument()
  })

  it('should be a div element', () => {
    const { container } = render(<BaseNodeFooter />)
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement)
  })

  it('should have border-top class', () => {
    const { container } = render(<BaseNodeFooter />)
    const footer = container.firstChild as HTMLElement
    expect(footer.className).toContain('border-t')
  })

  it('should have flex column layout', () => {
    const { container } = render(<BaseNodeFooter />)
    const footer = container.firstChild as HTMLElement
    expect(footer.className).toContain('flex')
    expect(footer.className).toContain('flex-col')
  })

  it('should accept custom className', () => {
    const { container } = render(<BaseNodeFooter className="custom-footer" />)
    expect(container.firstChild).toHaveClass('custom-footer')
  })

  it('should forward ref correctly', () => {
    const ref = vi.fn()
    render(<BaseNodeFooter ref={ref as any} />)
    expect(ref).toHaveBeenCalled()
  })
})