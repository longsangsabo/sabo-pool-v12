import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ProfileTabs extends StatelessWidget {
  final String activeTab;
  final Function(String) onChange;
  final bool isDark;

  const ProfileTabs({
    super.key,
    required this.activeTab,
    required this.onChange,
    this.isDark = true,
  });

  @override
  Widget build(BuildContext context) {
    final tabs = [
      {
        'key': 'activities',
        'label': 'Hoạt động',
        'icon': Icons.timeline,
      },
      {
        'key': 'edit',
        'label': 'Cá nhân',
        'icon': Icons.person_outline,
      },
      {
        'key': 'rank',
        'label': 'Đăng ký hạng',
        'icon': Icons.emoji_events_outlined,
      },
      {
        'key': 'spa-history',
        'label': 'SPA',
        'icon': Icons.account_balance_wallet_outlined,
      },
      {
        'key': 'club',
        'label': 'Đăng ký CLB',
        'icon': Icons.star_outline,
      },
    ];

    return Container(
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isDark
                ? Colors.grey.shade700.withValues(alpha: 0.5)
                : Colors.grey.shade200,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: tabs.map((tab) {
          final isActive = activeTab == tab['key'];
          return Expanded(
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () {
                  HapticFeedback.selectionClick();
                  onChange(tab['key'] as String);
                },
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                  decoration: BoxDecoration(
                    border: isActive
                        ? Border(
                            bottom: BorderSide(
                              color: Colors.blue.shade400,
                              width: 2,
                            ),
                          )
                        : null,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(bottom: 4),
                        child: Icon(
                          tab['icon'] as IconData,
                          size: 16,
                          color: isActive
                              ? (isDark ? Colors.white : Colors.grey.shade900)
                              : (isDark
                                  ? Colors.grey.shade300
                                  : Colors.grey.shade600),
                        ),
                      ),
                      Text(
                        tab['label'] as String,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isActive
                              ? (isDark ? Colors.white : Colors.grey.shade900)
                              : (isDark
                                  ? Colors.grey.shade300
                                  : Colors.grey.shade600),
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
