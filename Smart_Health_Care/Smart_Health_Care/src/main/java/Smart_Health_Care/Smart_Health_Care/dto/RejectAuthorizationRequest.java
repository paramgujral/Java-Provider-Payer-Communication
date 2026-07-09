package Smart_Health_Care.Smart_Health_Care.dto;


public class RejectAuthorizationRequest {

    private String comments;

    public RejectAuthorizationRequest() {
    }

    public RejectAuthorizationRequest(String comments) {
        this.comments = comments;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
