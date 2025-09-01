import 'package:flutter/material.dart';

// Mobile Profile Tabs Widget - port từ ProfileTabsMobile.tsx
class ProfileTabsMobile extends StatelessWidget {
  final String activeTab;
  final Function(String) onChange;
  final bool isDark;

  const ProfileTabsMobile({
    super.key,
    required this.activeTab,
    required this.onChange,
    required this.isDark,
  });

  static const List<Map<String, dynamic>> tabs = [
    {
      'key': 'activities',
      'label': 'Hoạt động',
      'icon': Icons.timeline,
      'color': Colors.blue,
    },
    {
      'key': 'edit',
      'label': 'Cá nhân',
      'icon': Icons.person,
      'color': Colors.green,
    },
    {
      'key': 'rank',
      'label': 'Đăng ký hạng',
      'icon': Icons.emoji_events,
      'color': Colors.purple,
    },
    {
      'key': 'spa-history',
      'label': 'SPA',
      'icon': Icons.account_balance_wallet,
      'color': Colors.amber,
    },
    {
      'key': 'club',
      'label': 'Đăng ký CLB',
      'icon': Icons.group,
      'color': Colors.cyan,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isDark
                ? Colors.grey[700]!.withValues(alpha: 0.5)
                : Colors.grey[200]!,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: tabs.map((tab) {
          final isActive = activeTab == tab['key'];
          return Expanded(
            child: InkWell(
              onTap: () => onChange(tab['key']),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: isActive
                      ? Border(
                          bottom: BorderSide(
                            color: tab['color'],
                            width: 2,
                          ),
                        )
                      : null,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      margin: const EdgeInsets.only(bottom: 4),
                      child: Icon(
                        tab['icon'],
                        size: 16,
                        color: isActive
                            ? (isDark ? tab['color'][300] : tab['color'][600])
                            : (isDark ? Colors.grey[400] : Colors.grey[500]),
                      ),
                    ),
                    Text(
                      tab['label'],
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isActive
                            ? (isDark ? Colors.white : Colors.grey[900])
                            : (isDark ? Colors.grey[300] : Colors.grey[600]),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
