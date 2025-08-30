# Design System Usage Examples

## Overview
Real-world implementation examples showing how to effectively use the Sabo Pool Design System components and patterns.

## Common Patterns

### Card Layouts
Standard card implementation with consistent spacing:

```tsx
// Basic Card
<Card className="card-spacing">
  <CardHeader>
    <CardTitle className="text-title-medium">Card Title</CardTitle>
    <CardDescription className="text-body-small-muted">
      Card description text
    </CardDescription>
  </CardHeader>
  <CardContent className="stack-normal">
    <div className="text-body">Card content goes here</div>
    <div className="flex inline-normal">
      <Button>Primary Action</Button>
      <Button variant="outline">Secondary</Button>
    </div>
  </CardContent>
</Card>

// Profile Card Example
<Card className="card-spacing">
  <div className="flex items-center stack-normal">
    <DynamicSizer width={64} height={64} className="rounded-full overflow-hidden">
      <img src={avatar} alt="User Avatar" />
    </DynamicSizer>
    <div className="stack-tight">
      <h3 className="text-title-semibold">John Doe</h3>
      <p className="text-body-small-neutral">Software Developer</p>
      <div className="flex inline-tight">
        <span className="text-caption-neutral">Last active:</span>
        <span className="text-caption-medium">2 hours ago</span>
      </div>
    </div>
  </div>
</Card>
```

### Form Layouts
Consistent form implementations with proper spacing:

```tsx
// Standard Form
<form className="form-spacing max-w-md">
  <div className="form-field">
    <label className="text-body-small-medium">Full Name</label>
    <input 
      type="text" 
      className="content-spacing w-full border border-neutral-300 rounded-md"
      placeholder="Enter your full name"
    />
  </div>
  
  <div className="form-field">
    <label className="text-body-small-medium">Email Address</label>
    <input 
      type="email" 
      className="content-spacing w-full border border-neutral-300 rounded-md"
      placeholder="Enter your email"
    />
    <p className="text-caption-neutral mt-1">We'll never share your email</p>
  </div>
  
  <div className="form-field">
    <label className="text-body-small-medium">Password</label>
    <input 
      type="password" 
      className="content-spacing w-full border border-neutral-300 rounded-md"
    />
  </div>
  
  <div className="flex inline-normal">
    <Button type="submit" className="flex-1">Create Account</Button>
    <Button variant="outline">Cancel</Button>
  </div>
</form>

// Inline Form
<form className="flex inline-normal items-end">
  <div className="form-field flex-1">
    <label className="text-body-small-medium">Search</label>
    <input 
      type="text" 
      className="content-spacing w-full border border-neutral-300 rounded-md"
      placeholder="Search tournaments..."
    />
  </div>
  <Button type="submit">Search</Button>
</form>
```

### Dashboard Layouts
Layout patterns for dashboard interfaces:

```tsx
// Dashboard Header
<header className="bg-white border-b border-neutral-200 section-spacing">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-heading-bold">Dashboard</h1>
        <p className="text-body-small-neutral">Welcome back, manage your arena</p>
      </div>
      <div className="flex inline-normal">
        <Button variant="outline">Settings</Button>
        <Button>New Tournament</Button>
      </div>
    </div>
  </div>
</header>

// Stats Grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {stats.map((stat) => (
    <Card key={stat.id} className="card-spacing">
      <div className="stack-tight">
        <p className="text-body-small-neutral">{stat.label}</p>
        <p className="text-heading-bold text-primary-600">{stat.value}</p>
        <div className="flex items-center inline-tight">
          <span className={`text-caption-medium ${
            stat.change > 0 ? 'text-success-600' : 'text-error-600'
          }`}>
            {stat.change > 0 ? '+' : ''}{stat.change}%
          </span>
          <span className="text-caption-neutral">from last month</span>
        </div>
      </div>
    </Card>
  ))}
</div>

// Content Grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 stack-normal">
    <Card className="card-spacing">
      <CardHeader>
        <CardTitle className="text-title-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="stack-normal">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
              <div className="stack-tight">
                <p className="text-body-medium">{activity.title}</p>
                <p className="text-body-small-neutral">{activity.description}</p>
              </div>
              <span className="text-caption-neutral">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
  
  <div className="stack-normal">
    <Card className="card-spacing">
      <CardHeader>
        <CardTitle className="text-title-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="stack-normal">
        <Button className="w-full">Create Tournament</Button>
        <Button variant="outline" className="w-full">Manage Tables</Button>
        <Button variant="outline" className="w-full">View Reports</Button>
      </CardContent>
    </Card>
  </div>
</div>
```

### Data Display
Patterns for displaying data consistently:

```tsx
// Table Layout
<Card className="card-spacing">
  <CardHeader>
    <CardTitle className="text-title-medium">Tournament Results</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left text-body-small-medium py-3">Player</th>
            <th className="text-left text-body-small-medium py-3">Score</th>
            <th className="text-left text-body-small-medium py-3">Status</th>
          </tr>
        </thead>
        <tbody className="stack-tight">
          {results.map((result) => (
            <tr key={result.id} className="border-b border-neutral-100">
              <td className="text-body py-3">{result.player}</td>
              <td className="text-body-medium py-3">{result.score}</td>
              <td className="py-3">
                <span className={`text-caption-medium px-2 py-1 rounded-full ${
                  result.status === 'active' ? 'bg-success-100 text-success-600' :
                  result.status === 'pending' ? 'bg-warning-100 text-warning-600' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {result.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>

// List Display
<Card className="card-spacing">
  <CardHeader>
    <CardTitle className="text-title-medium">Active Players</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="stack-normal">
      {players.map((player) => (
        <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
          <div className="flex items-center inline-normal">
            <DynamicSizer width={40} height={40} className="rounded-full overflow-hidden">
              <img src={player.avatar} alt={player.name} />
            </DynamicSizer>
            <div className="stack-tight">
              <p className="text-body-medium">{player.name}</p>
              <p className="text-body-small-neutral">Rank: {player.rank}</p>
            </div>
          </div>
          <div className="text-right stack-tight">
            <p className="text-body-small-medium">{player.points} pts</p>
            <p className="text-caption-neutral">Last game: {player.lastGame}</p>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

## Responsive Patterns

### Mobile-First Approach
Design system components work responsively:

```tsx
// Responsive Card Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {items.map((item) => (
    <Card key={item.id} className="card-spacing">
      <div className="stack-normal">
        <h3 className="text-title-medium lg:text-heading-semibold">{item.title}</h3>
        <p className="text-body-small lg:text-body">{item.description}</p>
        <Button size="sm" className="lg:size-default">
          {item.action}
        </Button>
      </div>
    </Card>
  ))}
</div>

// Responsive Navigation
<nav className="section-spacing">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center inline-normal">
        <h1 className="text-title-semibold lg:text-heading-bold">SABO Pool</h1>
      </div>
      
      {/* Desktop Navigation */}
      <div className="hidden lg:flex inline-normal">
        <Button variant="ghost">Tournaments</Button>
        <Button variant="ghost">Players</Button>
        <Button variant="ghost">Rankings</Button>
        <Button>Join Game</Button>
      </div>
      
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="lg:hidden">
        ☰
      </Button>
    </div>
  </div>
</nav>
```

### Progressive Enhancement
Enhance experiences with larger screens:

```tsx
// Progressive Form Layout
<form className="max-w-md lg:max-w-2xl mx-auto form-spacing">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
    <div className="form-field">
      <label className="text-body-small-medium">First Name</label>
      <input className="content-spacing w-full border rounded-md" />
    </div>
    <div className="form-field">
      <label className="text-body-small-medium">Last Name</label>
      <input className="content-spacing w-full border rounded-md" />
    </div>
  </div>
  
  <div className="form-field lg:col-span-2">
    <label className="text-body-small-medium">Email Address</label>
    <input className="content-spacing w-full border rounded-md" />
  </div>
  
  <div className="flex flex-col sm:flex-row inline-normal">
    <Button type="submit" className="flex-1">Submit</Button>
    <Button variant="outline">Cancel</Button>
  </div>
</form>
```

## Animation Patterns

### Progress Indicators
Dynamic progress with CSS custom properties:

```tsx
// Progress Bar
<div className="w-full">
  <div className="flex justify-between mb-2">
    <span className="text-body-small-medium">Upload Progress</span>
    <span className="text-body-small-neutral">{progress}%</span>
  </div>
  <div className="w-full bg-neutral-200 rounded-full h-2">
    <div 
      className="progress-bar-dynamic bg-primary-600 h-2 rounded-full"
      style={{ "--progress-width": `${progress}%` }}
    />
  </div>
</div>

// Animated Content Loading
<div className="stack-normal">
  {isLoading ? (
    <div className="stack-normal animate-pulse">
      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
      <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
    </div>
  ) : (
    <div className="stack-normal">
      <h2 className="text-title-medium">{content.title}</h2>
      <p className="text-body">{content.description}</p>
    </div>
  )}
</div>
```

## Best Practices Summary

### Component Usage
1. **Prefer semantic components** over custom implementations
2. **Use consistent spacing** with design system utilities
3. **Follow responsive patterns** for all screen sizes
4. **Maintain accessibility** with proper semantic HTML

### Pattern Consistency
1. **Establish clear hierarchies** with typography scales
2. **Use consistent spacing** between related elements
3. **Group related actions** with appropriate button variants
4. **Provide clear feedback** with color and animation

### Performance Considerations
1. **Leverage CSS custom properties** for dynamic values
2. **Use semantic classes** for better CSS caching
3. **Minimize inline styles** in favor of design system classes
4. **Optimize responsive behavior** with mobile-first approach
