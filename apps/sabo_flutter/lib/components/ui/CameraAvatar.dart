import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';

/// Camera-enabled Avatar component for COPILOT 2 features
/// Provides camera capture, gallery selection, and real-time preview
class CameraAvatar extends StatefulWidget {
  final String? currentAvatarUrl;
  final Function(File)? onImageSelected;
  final Function(String)? onAvatarUploaded;
  final double size;
  final bool showUploadButton;
  final bool enabled;

  const CameraAvatar({
    super.key,
    this.currentAvatarUrl,
    this.onImageSelected,
    this.onAvatarUploaded,
    this.size = 120,
    this.showUploadButton = true,
    this.enabled = true,
  });

  @override
  State<CameraAvatar> createState() => _CameraAvatarState();
}

class _CameraAvatarState extends State<CameraAvatar> {
  final ImagePicker _picker = ImagePicker();
  File? _selectedImage;
  bool _isUploading = false;

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Main avatar display
        Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: Theme.of(context).primaryColor,
              width: 3,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 10,
                spreadRadius: 2,
              ),
            ],
          ),
          child: ClipOval(
            child: _buildAvatarContent(),
          ),
        ),

        // Upload overlay when uploading
        if (_isUploading)
          Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.black.withOpacity(0.5),
            ),
            child: const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          ),

        // Camera button
        if (widget.showUploadButton && widget.enabled && !_isUploading)
          Positioned(
            bottom: 0,
            right: 0,
            child: GestureDetector(
              onTap: _showImageSourceOptions,
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Theme.of(context).primaryColor,
                  border: Border.all(
                    color: Colors.white,
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 8,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.camera_alt,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildAvatarContent() {
    if (_selectedImage != null) {
      return Image.file(
        _selectedImage!,
        width: widget.size,
        height: widget.size,
        fit: BoxFit.cover,
      );
    }

    if (widget.currentAvatarUrl != null && widget.currentAvatarUrl!.isNotEmpty) {
      return Image.network(
        widget.currentAvatarUrl!,
        width: widget.size,
        height: widget.size,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return _buildPlaceholder();
        },
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Center(
            child: CircularProgressIndicator(
              value: loadingProgress.expectedTotalBytes != null
                  ? loadingProgress.cumulativeBytesLoaded /
                      loadingProgress.expectedTotalBytes!
                  : null,
            ),
          );
        },
      );
    }

    return _buildPlaceholder();
  }

  Widget _buildPlaceholder() {
    return Container(
      width: widget.size,
      height: widget.size,
      color: Colors.grey.shade200,
      child: Icon(
        Icons.person,
        size: widget.size * 0.5,
        color: Colors.grey.shade500,
      ),
    );
  }

  void _showImageSourceOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Chọn ảnh đại diện',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildSourceOption(
                    icon: Icons.camera_alt,
                    label: 'Camera',
                    onTap: () => _pickImage(ImageSource.camera),
                  ),
                  _buildSourceOption(
                    icon: Icons.photo_library,
                    label: 'Thư viện',
                    onTap: () => _pickImage(ImageSource.gallery),
                  ),
                  if (_selectedImage != null || widget.currentAvatarUrl != null)
                    _buildSourceOption(
                      icon: Icons.delete,
                      label: 'Xóa',
                      onTap: _removeImage,
                      color: Colors.red,
                    ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSourceOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color? color,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: (color ?? Theme.of(context).primaryColor).withOpacity(0.1),
              border: Border.all(
                color: color ?? Theme.of(context).primaryColor,
                width: 2,
              ),
            ),
            child: Icon(
              icon,
              color: color ?? Theme.of(context).primaryColor,
              size: 30,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              color: color ?? Theme.of(context).primaryColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    Navigator.pop(context);

    // Request permissions
    Permission permission = source == ImageSource.camera 
        ? Permission.camera 
        : Permission.photos;
    
    PermissionStatus status = await permission.request();
    if (status.isDenied) {
      _showPermissionDialog();
      return;
    }

    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 85,
      );

      if (image != null) {
        final File imageFile = File(image.path);
        
        setState(() {
          _selectedImage = imageFile;
        });

        // Notify parent about image selection
        if (widget.onImageSelected != null) {
          widget.onImageSelected!(imageFile);
        }

        // Start upload process
        await _uploadImage(imageFile);
      }
    } catch (e) {
      _showErrorDialog('Lỗi khi chọn ảnh: $e');
    }
  }

  Future<void> _uploadImage(File imageFile) async {
    setState(() {
      _isUploading = true;
    });

    try {
      // Simulate upload process
      await Future.delayed(const Duration(seconds: 2));
      
      // Mock upload URL
      final String uploadedUrl = 'https://example.com/avatar_${DateTime.now().millisecondsSinceEpoch}.jpg';
      
      if (widget.onAvatarUploaded != null) {
        widget.onAvatarUploaded!(uploadedUrl);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cập nhật ảnh đại diện thành công!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      _showErrorDialog('Lỗi khi tải ảnh lên: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  void _removeImage() {
    Navigator.pop(context);
    setState(() {
      _selectedImage = null;
    });
    
    if (widget.onAvatarUploaded != null) {
      widget.onAvatarUploaded!('');
    }
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Cần quyền truy cập'),
          content: const Text('Ứng dụng cần quyền truy cập camera/thư viện để tải ảnh đại diện.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                openAppSettings();
              },
              child: const Text('Mở cài đặt'),
            ),
          ],
        );
      },
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Lỗi'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            ),
          ],
        );
      },
    );
  }
}
