import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sabo_flutter/core/theme/app_theme.dart';
import 'package:sabo_flutter/core/design_system/design_tokens.dart';
import 'package:sabo_flutter/core/design_system/typography_system.dart';

void main() {
  runApp(
    const ProviderScope(
      child: SaboApp(),
    ),
  );
}

class SaboApp extends StatelessWidget {
  const SaboApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SABO Pool v12 - Flutter Design System Demo',
      theme: SaboTheme.lightTheme,
      darkTheme: SaboTheme.darkTheme,
      themeMode: ThemeMode.dark, // Demo với dark theme
      home: const DesignSystemDemoScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class DesignSystemDemoScreen extends StatelessWidget {
  const DesignSystemDemoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'SABO Pool Design System',
          style: SaboTypographySystem.h5.copyWith(color: Colors.white),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ===== TYPOGRAPHY DEMO =====
            Text(
              'Typography System',
              style: SaboTypographySystem.h2.copyWith(
                color: SaboDesignTokens.colorPrimary400,
              ),
            ),
            const SizedBox(height: 24),

            // Headings
            Text('H1 Heading', style: SaboTypographySystem.h1),
            Text('H2 Heading', style: SaboTypographySystem.h2),
            Text('H3 Heading', style: SaboTypographySystem.h3),
            Text('H4 Heading', style: SaboTypographySystem.h4),
            Text('H5 Heading', style: SaboTypographySystem.h5),
            Text('H6 Heading', style: SaboTypographySystem.h6),
            
            const SizedBox(height: 24),

            // Body text
            Text('Body Large', style: SaboTypographySystem.bodyLg),
            Text('Body Medium', style: SaboTypographySystem.bodyMd),
            Text('Body Small', style: SaboTypographySystem.bodySm),
            Text('Body XSmall', style: SaboTypographySystem.bodyXs),
            
            const SizedBox(height: 24),

            // Interface text
            Text('Button Large', style: SaboTypographySystem.buttonLg),
            Text('Button Medium', style: SaboTypographySystem.buttonMd),
            Text('Button Small', style: SaboTypographySystem.buttonSm),
            Text('Label Text', style: SaboTypographySystem.label),
            Text('Caption Text', style: SaboTypographySystem.caption),

            const SizedBox(height: 24),

            // Numeric text
            Text('123,456.78', style: SaboTypographySystem.numericLg),
            Text('1,234.56', style: SaboTypographySystem.numericMd),
            Text('123.45', style: SaboTypographySystem.numericSm),

            const SizedBox(height: 32),

            // ===== COLOR DEMO =====
            Text(
              'Color System',
              style: SaboTypographySystem.h2.copyWith(
                color: SaboDesignTokens.colorPrimary400,
              ),
            ),
            const SizedBox(height: 24),

            // Primary colors
            Text('Primary Colors', style: SaboTypographySystem.h4),
            const SizedBox(height: 16),
            const Row(
              children: [
                _ColorBox(SaboDesignTokens.colorPrimary400, 'Primary 400'),
                SizedBox(width: 8),
                _ColorBox(SaboDesignTokens.colorPrimary600, 'Primary 600'),
                SizedBox(width: 8),
                _ColorBox(SaboDesignTokens.colorPrimary800, 'Primary 800'),
              ],
            ),

            const SizedBox(height: 24),

            // Secondary colors
            Text('Secondary Colors', style: SaboTypographySystem.h4),
            const SizedBox(height: 16),
            const Row(
              children: [
                _ColorBox(SaboDesignTokens.colorSecondary400, 'Secondary 400'),
                SizedBox(width: 8),
                _ColorBox(SaboDesignTokens.colorSecondary600, 'Secondary 600'),
                SizedBox(width: 8),
                _ColorBox(SaboDesignTokens.colorSecondary800, 'Secondary 800'),
              ],
            ),

            const SizedBox(height: 24),

            // Semantic colors
            Text('Semantic Colors', style: SaboTypographySystem.h4),
            const SizedBox(height: 16),
            const Row(
              children: [
                _ColorBox(SaboDesignTokens.colorSuccess600, 'Success'),
                SizedBox(width: 8),
                _ColorBox(SaboDesignTokens.colorWarning600, 'Warning'),
                SizedBox(width: 8),
                _ColorBox(SaboDesignTokens.colorError600, 'Error'),
                SizedBox(width: 8),
                _ColorBox(SaboDesignTokens.colorInfo600, 'Info'),
              ],
            ),

            const SizedBox(height: 32),

            // ===== COMPONENT DEMO =====
            Text(
              'Components',
              style: SaboTypographySystem.h2.copyWith(
                color: SaboDesignTokens.colorPrimary400,
              ),
            ),
            const SizedBox(height: 24),

            // Buttons
            Text('Buttons', style: SaboTypographySystem.h4),
            const SizedBox(height: 16),
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                ElevatedButton(
                  onPressed: () {},
                  child: const Text('Primary Button'),
                ),
                OutlinedButton(
                  onPressed: () {},
                  child: const Text('Outlined Button'),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('Text Button'),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Cards
            Text('Cards', style: SaboTypographySystem.h4),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(SaboDesignTokens.spacingLg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Sample Card',
                      style: SaboTypographySystem.h5,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'This is a sample card component using the SABO design system. It demonstrates how the design tokens work together.',
                      style: SaboTypographySystem.bodyMd,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () {},
                          child: const Text('Cancel'),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: () {},
                          child: const Text('Action'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Input fields
            Text('Input Fields', style: SaboTypographySystem.h4),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Email',
                hintText: 'Enter your email',
                prefixIcon: Icon(Icons.email),
              ),
            ),
            const SizedBox(height: 16),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Password',
                hintText: 'Enter your password',
                prefixIcon: Icon(Icons.lock),
                suffixIcon: Icon(Icons.visibility_off),
              ),
              obscureText: true,
            ),

            const SizedBox(height: 32),

            // ===== SPACING DEMO =====
            Text(
              'Spacing System',
              style: SaboTypographySystem.h2.copyWith(
                color: SaboDesignTokens.colorPrimary400,
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(SaboDesignTokens.spacingMd),
              decoration: BoxDecoration(
                color: SaboDesignTokens.colorNeutral800,
                borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Spacing Examples',
                    style: SaboTypographySystem.h5,
                  ),
                  const SizedBox(height: SaboDesignTokens.spacingSm),
                  Text(
                    'XS: ${SaboDesignTokens.spacingXs}px',
                    style: SaboTypographySystem.bodyMd,
                  ),
                  const SizedBox(height: SaboDesignTokens.spacingSm),
                  Text(
                    'SM: ${SaboDesignTokens.spacingSm}px',
                    style: SaboTypographySystem.bodyMd,
                  ),
                  const SizedBox(height: SaboDesignTokens.spacingSm),
                  Text(
                    'MD: ${SaboDesignTokens.spacingMd}px',
                    style: SaboTypographySystem.bodyMd,
                  ),
                  const SizedBox(height: SaboDesignTokens.spacingSm),
                  Text(
                    'LG: ${SaboDesignTokens.spacingLg}px',
                    style: SaboTypographySystem.bodyMd,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 48),

            // Footer
            Center(
              child: Text(
                '✨ SABO Pool Design System v12 - Complete ✨',
                style: SaboTypographySystem.h4.copyWith(
                  color: SaboDesignTokens.colorPrimary400,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _ColorBox extends StatelessWidget {
  final Color color;
  final String label;

  const _ColorBox(this.color, this.label);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
            border: Border.all(
              color: SaboDesignTokens.colorNeutral700,
              width: 1,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: SaboTypographySystem.caption,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
