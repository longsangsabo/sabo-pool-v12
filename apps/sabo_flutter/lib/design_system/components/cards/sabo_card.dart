import 'package:flutter/material.dart';
import '../../design_system/sabo_design_system.dart';

/// SABO Pool - Unified Card Component
/// Replaces all duplicate card implementations
class SaboCard extends StatelessWidget {
  final Widget child;
  final SaboCardVariant variant;
  final VoidCallback? onTap;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final bool showShadow;
  final List<BoxShadow>? customShadow;

  const SaboCard({
    super.key,
    required this.child,
    this.variant = SaboCardVariant.elevated,
    this.onTap,
    this.padding,
    this.margin,
    this.showShadow = true,
    this.customShadow,
  });

  const SaboCard.elevated({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.margin,
    this.showShadow = true,
    this.customShadow,
  }) : variant = SaboCardVariant.elevated;

  const SaboCard.outlined({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.margin,
    this.showShadow = false,
    this.customShadow,
  }) : variant = SaboCardVariant.outlined;

  const SaboCard.filled({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.margin,
    this.showShadow = false,
    this.customShadow,
  }) : variant = SaboCardVariant.filled;

  @override
  Widget build(BuildContext context) {
    final cardDecoration = _getCardDecoration();
    final cardPadding = padding ?? EdgeInsets.all(SaboSpacing.md);
    final cardMargin = margin ?? EdgeInsets.all(SaboSpacing.xs);

    Widget card = Container(
      margin: cardMargin,
      padding: cardPadding,
      decoration: cardDecoration,
      child: child,
    );

    if (onTap != null) {
      card = InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: card,
      );
    }

    return card;
  }

  BoxDecoration _getCardDecoration() {
    switch (variant) {
      case SaboCardVariant.elevated:
        return BoxDecoration(
          color: SaboColors.surfaceContainer,
          borderRadius: BorderRadius.circular(12),
          boxShadow: showShadow 
              ? (customShadow ?? SaboElevation.shadowLevel1)
              : null,
        );
      case SaboCardVariant.outlined:
        return BoxDecoration(
          color: SaboColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: SaboColors.onSurfaceSecondary.withOpacity(0.2),
            width: 1,
          ),
        );
      case SaboCardVariant.filled:
        return BoxDecoration(
          color: SaboColors.surfaceVariant,
          borderRadius: BorderRadius.circular(12),
        );
    }
  }
}

enum SaboCardVariant {
  elevated,
  outlined,
  filled,
}

/// Specialized Stats Card Component
class SaboStatsCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color? iconColor;
  final String? subtitle;
  final VoidCallback? onTap;

  const SaboStatsCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.iconColor,
    this.subtitle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SaboCard.elevated(
      onTap: onTap,
      showShadow: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(SaboSpacing.xs),
                decoration: BoxDecoration(
                  color: (iconColor ?? SaboColors.primary).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: iconColor ?? SaboColors.primary,
                  size: 20,
                ),
              ),
              const Spacer(),
              if (onTap != null)
                Icon(
                  Icons.chevron_right_rounded,
                  color: SaboColors.onSurfaceSecondary,
                  size: 16,
                ),
            ],
          ),
          SizedBox(height: SaboSpacing.sm),
          Text(
            value,
            style: SaboTextStyles.statsValue.copyWith(
              color: SaboColors.onSurface,
            ),
          ),
          SizedBox(height: SaboSpacing.xxs),
          Text(
            title,
            style: SaboTextStyles.statsLabel.copyWith(
              color: SaboColors.onSurfaceVariant,
            ),
          ),
          if (subtitle != null) ...[
            SizedBox(height: SaboSpacing.xxs),
            Text(
              subtitle!,
              style: SaboTextStyles.bodySmall.copyWith(
                color: SaboColors.onSurfaceSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Specialized Tournament Card Component
class SaboTournamentCard extends StatelessWidget {
  final String name;
  final String prize;
  final String status;
  final String date;
  final int participants;
  final VoidCallback? onTap;
  final bool isHighlighted;

  const SaboTournamentCard({
    super.key,
    required this.name,
    required this.prize,
    required this.status,
    required this.date,
    required this.participants,
    this.onTap,
    this.isHighlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    return SaboCard.elevated(
      onTap: onTap,
      customShadow: isHighlighted ? SaboElevation.primaryGlow : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: SaboSpacing.xs,
                  vertical: SaboSpacing.xxs,
                ),
                decoration: BoxDecoration(
                  color: _getStatusColor(),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  status,
                  style: SaboTextStyles.labelSmall.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Spacer(),
              Icon(
                Icons.emoji_events_rounded,
                color: Colors.amber[600],
                size: 24,
              ),
            ],
          ),
          SizedBox(height: SaboSpacing.sm),
          Text(
            name,
            style: SaboTextStyles.tournamentTitle.copyWith(
              color: SaboColors.onSurface,
            ),
          ),
          SizedBox(height: SaboSpacing.xs),
          Row(
            children: [
              Icon(
                Icons.monetization_on_rounded,
                color: SaboColors.success,
                size: 16,
              ),
              SizedBox(width: SaboSpacing.xxs),
              Text(
                prize,
                style: SaboTextStyles.prizeAmount.copyWith(
                  color: SaboColors.success,
                ),
              ),
            ],
          ),
          SizedBox(height: SaboSpacing.xs),
          Row(
            children: [
              Icon(
                Icons.people_rounded,
                color: SaboColors.onSurfaceVariant,
                size: 16,
              ),
              SizedBox(width: SaboSpacing.xxs),
              Text(
                '$participants người tham gia',
                style: SaboTextStyles.bodySmall.copyWith(
                  color: SaboColors.onSurfaceVariant,
                ),
              ),
              const Spacer(),
              Text(
                date,
                style: SaboTextStyles.bodySmall.copyWith(
                  color: SaboColors.onSurfaceSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getStatusColor() {
    switch (status.toLowerCase()) {
      case 'đang diễn ra':
      case 'live':
        return SaboColors.statusActive;
      case 'sắp diễn ra':
      case 'upcoming':
        return SaboColors.statusPending;
      case 'đã kết thúc':
      case 'completed':
        return SaboColors.statusCompleted;
      case 'đã hủy':
      case 'cancelled':
        return SaboColors.statusCancelled;
      default:
        return SaboColors.primary;
    }
  }
}
