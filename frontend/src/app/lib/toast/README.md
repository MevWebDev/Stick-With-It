# Toast System Usage Guide

## Overview

The toast notification system provides a universal way to show notifications anywhere in your app.

## Setup

The `ToastProvider` is already configured in the root layout, so you can use toasts anywhere in your app!

## Basic Usage

### 1. Import the hook

```tsx
import { useToast } from "@/app/lib/toast/ToastContext";
```

### 2. Use in your component

```tsx
function MyComponent() {
  const { showToast, showXpToast } = useToast();

  const handleSuccess = () => {
    showToast("Operation successful!", "success");
  };

  const handleError = () => {
    showToast("Something went wrong!", "error");
  };

  const handleXp = () => {
    showXpToast(50, "Challenge Complete!");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleXp}>Show XP</button>
    </div>
  );
}
```

## Toast Types

1. **success** - Green toast with checkmark ✓
2. **error** - Red toast with X ✕
3. **warning** - Yellow toast with warning symbol ⚠
4. **info** - Blue toast with info symbol ℹ
5. **xp** - Purple/pink gradient toast with star ⭐ (special XP animation)

## API

### `showToast(message, type?, duration?, xpAmount?)`

- **message**: The text to display
- **type**: Toast type (default: "info")
- **duration**: How long to show in ms (default: 3000)
- **xpAmount**: Optional XP amount for XP toasts

### `showXpToast(xpAmount, message?)`

- **xpAmount**: The XP amount to display
- **message**: Optional message (default: "XP Earned!")

## Examples

```tsx
// Simple info toast
showToast("Loading complete");

// Success with custom duration
showToast("Saved successfully!", "success", 5000);

// Error toast
showToast("Failed to save", "error");

// XP toast
showXpToast(25);

// XP toast with custom message
showXpToast(100, "Level Up!");
```

## Features

- ✨ Beautiful animations with Framer Motion
- 🎨 5 different toast types
- ⏱️ Auto-dismiss with configurable duration
- 🖱️ Click to dismiss
- 📱 Mobile responsive
- 🎯 Positioned at top-right
- 🌈 Special XP toast with gradient and animation
