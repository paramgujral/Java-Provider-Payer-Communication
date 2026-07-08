import com.healthconn.healthcare_connector.payer.dto.ReviewRequestDto;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import java.util.List;

public interface PayerService {
    List<AuthRequestResponseDto> getPendingRequests();
    AuthRequestResponseDto reviewRequest(Long requestId, ReviewRequestDto dto, Long payerId);
    List<AuthRequestResponseDto> getAllRequests();
}
